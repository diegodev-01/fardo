import { connectDB } from "../db";
import { parseClaim } from "@/lib/domain/comment-parser";
import {
  ACTIVE_CLAIM_STATUSES,
  canTransition,
  nextInQueue,
  shouldDisplace,
  type ClaimEvent,
  type ClaimStatus,
} from "@/lib/domain/claims";
import type { LiveComment } from "@/lib/live/provider";
import customerModel from "../models/customer.model";
import garmentModel from "../models/garment.model";
import { ClaimModel, LiveSessionModel, type IClaim } from "../models/live.model";
import { createSaleCore, updatePaymentCore } from "./sale.service";

export type IngestResult =
  | { kind: "ignored" }
  | { kind: "session_closed" }
  | { kind: "unknown_item"; code: string }
  | { kind: "duplicate" }
  | { kind: "claimed"; claimId: string; status: "PENDING" | "QUEUED"; code: string };

const isDup = (e: unknown, field?: string) => {
  const err = e as { code?: number; keyPattern?: Record<string, unknown> };
  return err.code === 11000 && (!field || !!err.keyPattern?.[field]);
};

const toEvent = (c: Pick<IClaim, "eventId" | "user" | "code" | "ts">): ClaimEvent => ({
  eventId: c.eventId,
  user: c.user,
  code: c.code,
  ts: c.ts,
});

/**
 * Turns one platform comment into a claim. Idempotent per (session, eventId).
 * Fairness comes from the partial unique index on (session, code): the database
 * decides which concurrent insert holds the item; an earlier-timestamp comment
 * that arrives late displaces a holder that is still PENDING.
 */
export async function ingestComment(sessionId: string, c: LiveComment): Promise<IngestResult> {
  const parsed = parseClaim(c.text);
  if (!parsed) return { kind: "ignored" };

  await connectDB();

  const session = await LiveSessionModel.exists({ _id: sessionId, status: "ACTIVE" });
  if (!session) return { kind: "session_closed" };

  const garment = await garmentModel
    .findOne({ code: parsed.code, deletedAt: null, isSold: false })
    .select("_id")
    .lean<{ _id: unknown }>();
  if (!garment) return { kind: "unknown_item", code: parsed.code };

  const base = {
    sessionId,
    eventId: c.eventId,
    user: c.user,
    code: parsed.code,
    garmentId: String(garment._id),
    ts: c.ts,
    text: c.text.slice(0, 300),
  };

  const create = async (status: "PENDING" | "QUEUED") => {
    try {
      const doc = await ClaimModel.create({ ...base, status });
      return { kind: "claimed", claimId: String(doc._id), status, code: base.code } as const;
    } catch (e) {
      if (isDup(e, "eventId")) return { kind: "duplicate" } as const;
      if (isDup(e)) return "taken" as const; // the item already has a holder
      throw e;
    }
  };

  const first = await create("PENDING");
  if (first !== "taken") return first;

  const holder = await ClaimModel.findOne({
    sessionId,
    code: base.code,
    status: { $in: ACTIVE_CLAIM_STATUSES },
  }).lean<IClaim>();

  if (holder && shouldDisplace(toEvent(base), { ...toEvent(holder), status: holder.status })) {
    const demoted = await ClaimModel.updateOne(
      { _id: holder._id, status: "PENDING" },
      { status: "QUEUED" },
    );
    if (demoted.modifiedCount === 1) {
      const retry = await create("PENDING");
      if (retry !== "taken") return retry;
    }
  }

  const queued = await create("QUEUED");
  if (queued === "taken") throw new Error("Unexpected duplicate while queueing claim");
  return queued;
}

// ---- review workflow (callers must be authorized) ----

async function getClaim(id: string) {
  const claim = await ClaimModel.findById(id);
  if (!claim) throw new Error("Reclamo no encontrado");
  return claim;
}

/** PENDING -> CONFIRMED and creates the pending sale for the customer. */
export async function confirmClaim(claimId: string, customerId: string, price?: number) {
  await connectDB();
  const claim = await getClaim(claimId);
  if (!canTransition(claim.status, "CONFIRMED")) throw new Error("Solo se puede confirmar un reclamo pendiente");

  const garment = await garmentModel.findById(claim.garmentId).lean<{ price: number }>();
  if (!garment) throw new Error("La prenda ya no existe");

  // Take the claim first so a double click cannot create two sales.
  const taken = await ClaimModel.findOneAndUpdate(
    { _id: claimId, status: "PENDING" },
    { status: "CONFIRMED", customerId },
    { new: true },
  );
  if (!taken) throw new Error("El reclamo cambió de estado");

  try {
    const sale = await createSaleCore({
      garmentId: claim.garmentId,
      customerId,
      price: price ?? garment.price,
      paymentState: "PENDIENTE",
    });
    taken.saleId = String(sale._id);
    await taken.save();
    return taken;
  } catch (e) {
    await ClaimModel.updateOne({ _id: claimId }, { status: "PENDING", $unset: { customerId: 1 } });
    throw e;
  }
}

export async function markClaimPaid(claimId: string) {
  await connectDB();
  const claim = await getClaim(claimId);
  if (!canTransition(claim.status, "PAID") || !claim.saleId) {
    throw new Error("Solo se puede cobrar un reclamo confirmado");
  }
  await updatePaymentCore(claim.saleId, "PAGADO");
  claim.status = "PAID";
  await claim.save();
  return claim;
}

/**
 * If the session has auto-confirm on and the commenter's TikTok handle matches
 * a registered customer, confirms the claim (creating the pending sale).
 * Returns true when it did; any failure leaves the claim PENDING for manual review.
 */
export async function autoConfirmClaim(claimId: string): Promise<boolean> {
  await connectDB();
  const claim = await ClaimModel.findById(claimId).lean<IClaim>();
  if (!claim || claim.status !== "PENDING") return false;
  const session = await LiveSessionModel.findById(claim.sessionId)
    .select("autoConfirm")
    .lean<{ autoConfirm?: boolean }>();
  if (!session?.autoConfirm) return false;
  const customer = await customerModel
    .findOne({ tiktokUser: claim.user.toLowerCase() })
    .select("_id")
    .lean<{ _id: unknown }>();
  if (!customer) return false;
  try {
    await confirmClaim(claimId, String(customer._id));
    return true;
  } catch (e) {
    console.error("Auto-confirm failed:", e);
    return false;
  }
}

async function promote(claimId: string) {
  try {
    await ClaimModel.updateOne({ _id: claimId, status: "QUEUED" }, { status: "PENDING" });
  } catch (e) {
    if (isDup(e)) throw new Error("El artículo ya tiene otro dueño");
    throw e;
  }
}

/** Frees the item (cancelling its sale if any) and offers it to the next queued claimant. */
export async function releaseClaim(claimId: string, opts: { promoteNext?: boolean } = {}) {
  await connectDB();
  const claim = await getClaim(claimId);
  if (!canTransition(claim.status, "RELEASED")) throw new Error("Este reclamo no se puede liberar");

  if (claim.saleId) await updatePaymentCore(claim.saleId, "CANCELADO");
  claim.status = "RELEASED";
  await claim.save();

  if (opts.promoteNext ?? true) {
    const queued = await ClaimModel.find({
      sessionId: claim.sessionId,
      code: claim.code,
      status: "QUEUED",
    }).lean<IClaim[]>();
    const next = nextInQueue(queued.map((q) => ({ ...toEvent(q), _id: q._id })));
    if (next) await promote(String(next._id));
  }
  return claim;
}

/** Moves the item from the current holder to a specific queued claimant. */
export async function reassignClaim(fromClaimId: string, toClaimId: string) {
  await connectDB();
  const [from, to] = await Promise.all([getClaim(fromClaimId), getClaim(toClaimId)]);
  if (from.sessionId !== to.sessionId || from.code !== to.code) throw new Error("Los reclamos no son del mismo artículo");
  if (to.status !== "QUEUED") throw new Error("El nuevo dueño debe estar en la cola");
  await releaseClaim(fromClaimId, { promoteNext: false });
  await promote(toClaimId);
}

export async function listClaims(sessionId: string) {
  await connectDB();
  const claims = await ClaimModel.find({ sessionId }).sort({ ts: 1 }).limit(500).lean<IClaim[]>();
  const ids = [...new Set(claims.map((c) => c.garmentId))];
  const garments = await garmentModel
    .find({ _id: { $in: ids } })
    .select("name price")
    .lean<{ _id: unknown; name: string; price: number }[]>();
  const byId = new Map(garments.map((g) => [String(g._id), g]));
  return claims.map((c) => ({
    ...c,
    _id: String(c._id),
    garmentName: byId.get(c.garmentId)?.name ?? "—",
    garmentPrice: byId.get(c.garmentId)?.price ?? 0,
  }));
}

export type ClaimRow = Awaited<ReturnType<typeof listClaims>>[number] & { status: ClaimStatus };
