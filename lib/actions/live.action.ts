"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { guard } from "@/lib/auth/guards";
import { invalidateMetrics } from "@/lib/services/metrics.service";
import { connectDB } from "../db";
import { LiveSessionModel } from "../models/live.model";
import * as hub from "../live/tiktok-hub";
import {
  confirmClaim,
  listClaims,
  markClaimPaid,
  reassignClaim,
  releaseClaim,
} from "../services/live.service";

type Fail = { success: false; error: string };

async function run<T>(fn: () => Promise<T>, fallback: string) {
  const g = await guard(["admin", "salesperson"]);
  if (!g.ok) return { success: false, error: g.error } as Fail;
  try {
    const data = await fn();
    invalidateMetrics();
    revalidatePath("/admin/live");
    revalidatePath("/salesperson/live");
    revalidatePath("/admin/orders");
    return { success: true as const, data: JSON.parse(JSON.stringify(data ?? null)) };
  } catch (e) {
    console.error(fallback, e);
    return { success: false, error: e instanceof Error ? e.message : fallback } as Fail;
  }
}

export async function listSessionsAction() {
  return run(async () => {
    await connectDB();
    return LiveSessionModel.find().sort({ createdAt: -1 }).limit(30).lean();
  }, "Error al listar transmisiones");
}

export async function createSessionAction(name: string) {
  return run(async () => {
    const parsed = z.string().trim().min(1).max(80).parse(name);
    await connectDB();
    return LiveSessionModel.create({ name: parsed });
  }, "Error al crear la transmisión");
}

export async function endSessionAction(id: string) {
  return run(async () => {
    await hub.disconnect(id);
    await connectDB();
    return LiveSessionModel.findByIdAndUpdate(
      id,
      { status: "ENDED", endedAt: new Date() },
      { new: true },
    );
  }, "Error al cerrar la transmisión");
}

export async function listClaimsAction(sessionId: string) {
  return run(() => listClaims(sessionId), "Error al listar reclamos");
}

export async function confirmClaimAction(id: string, customerId: string, price?: number) {
  return run(() => confirmClaim(id, customerId, price), "Error al confirmar");
}

export async function markClaimPaidAction(id: string) {
  return run(() => markClaimPaid(id), "Error al marcar pago");
}

export async function releaseClaimAction(id: string) {
  return run(() => releaseClaim(id), "Error al liberar");
}

export async function reassignClaimAction(fromId: string, toId: string) {
  return run(() => reassignClaim(fromId, toId), "Error al reasignar");
}

/** Connects the session to a TikTok host's live chat (username of the account that is live). */
export async function connectTikTokAction(sessionId: string, username: string) {
  return run(() => hub.connect(sessionId, username), "Error al conectar con TikTok");
}

export async function disconnectTikTokAction(sessionId: string) {
  return run(async () => {
    await hub.disconnect(sessionId);
    return null;
  }, "Error al desconectar de TikTok");
}

/** Live connection state + recent chat. Polled by the UI. */
export async function liveStatusAction(sessionId: string) {
  const g = await guard(["admin", "salesperson"]);
  if (!g.ok) return { success: false, error: g.error } as Fail;
  return { success: true as const, data: hub.snapshot(sessionId) };
}

export async function setAutoConfirmAction(sessionId: string, enabled: boolean) {
  return run(async () => {
    await connectDB();
    return LiveSessionModel.findByIdAndUpdate(sessionId, { autoConfirm: !!enabled }, { new: true });
  }, "Error al actualizar la automatización");
}
