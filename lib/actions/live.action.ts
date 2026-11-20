"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { guard } from "@/lib/auth/guards";
import { invalidateMetrics } from "@/lib/services/metrics.service";
import { connectDB } from "../db";
import garmentModel from "../models/garment.model";
import { LiveSessionModel } from "../models/live.model";
import { SimulatorProvider } from "../live/simulator";
import {
  confirmClaim,
  ingestComment,
  listClaims,
  markClaimPaid,
  reassignClaim,
  releaseClaim,
  type IngestResult,
} from "../services/live.service";

type Fail = { success: false; error: string };

async function run<T>(fn: () => Promise<T>, fallback: string) {
  const g = await guard(["admin"]);
  if (!g.ok) return { success: false, error: g.error } as Fail;
  try {
    const data = await fn();
    invalidateMetrics();
    revalidatePath("/admin/live");
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

/** Manual entry / simulator: feeds comments through the same path as the real ingest endpoint. */
export async function sendCommentAction(sessionId: string, user: string, text: string) {
  return run(
    () =>
      ingestComment(sessionId, {
        eventId: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user: user.trim().slice(0, 60) || "manual",
        text,
        ts: Date.now(),
      }),
    "Error al enviar comentario",
  );
}

export async function simulateLiveAction(sessionId: string, mode: "batch" | "race", count = 10) {
  return run(async () => {
    await connectDB();
    const garments = await garmentModel
      .find({ deletedAt: null, isSold: false, code: { $exists: true } })
      .select("code")
      .limit(50)
      .lean<{ code: string }[]>();
    const codes = garments.map((g) => g.code);
    if (!codes.length) throw new Error("No hay prendas con código disponibles para simular");

    const sim = new SimulatorProvider({ codes });
    const comments =
      mode === "race"
        ? sim.race(codes[Math.floor(Math.random() * codes.length)])
        : sim.generate(Math.min(count, 50));

    const results: IngestResult[] = [];
    for (const c of comments) results.push(await ingestComment(sessionId, c));
    return results;
  }, "Error en la simulación");
}
