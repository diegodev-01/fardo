import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestComment } from "@/lib/services/live.service";

const eventSchema = z.object({
  eventId: z.string().min(1).max(120),
  user: z.string().min(1).max(80),
  text: z.string().max(500),
  ts: z.number().int().positive().optional(),
});

const bodySchema = z.object({
  sessionId: z.string().min(1),
  events: z.array(eventSchema).min(1).max(200),
});

function authorized(req: NextRequest) {
  const secret = process.env.LIVE_INGEST_SECRET;
  const given = req.headers.get("x-live-secret");
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Entry point for an external connector (e.g. a worker running a TikTok Live
 * client) or webhook. Stateless and idempotent per eventId.
 * Body: { sessionId, events: [{ eventId, user, text, ts? }] }
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { sessionId, events } = parsed.data;
  try {
    const results = [];
    for (const e of events) {
      results.push(await ingestComment(sessionId, { ...e, ts: e.ts ?? Date.now() }));
    }
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error en POST /api/live/ingest:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
