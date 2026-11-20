import "server-only";
import { ControlEvent, TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";
import type { LiveComment } from "./provider";
import { connectDB } from "../db";
import { LiveSessionModel } from "../models/live.model";
import { autoConfirmClaim, ingestComment, type IngestResult } from "../services/live.service";

export type HubStatus = "idle" | "connecting" | "connected" | "reconnecting" | "offline" | "error";

export interface ChatEntry {
  id: string;
  user: string;
  text: string;
  ts: number;
  /** what the claim engine did with this comment */
  result: IngestResult["kind"] | "auto_confirmed" | "failed";
  code?: string;
}

interface Conn {
  sessionId: string;
  username: string;
  connection: TikTokLiveConnection | null;
  status: HubStatus;
  error?: string;
  viewers: number;
  chat: ChatEntry[];
  /** false once the user disconnects on purpose, so we stop reconnecting */
  wanted: boolean;
  retries: number;
}

export interface HubSnapshot {
  status: HubStatus;
  username: string;
  error?: string;
  viewers: number;
  chat: ChatEntry[];
}

const MAX_CHAT = 150;
const MAX_RETRIES = 5;

// A TikTok connection is a long-lived websocket, so it lives in process memory
// (survives Next dev reloads via globalThis). It needs a persistent Node server
// (`next start` / VM / container) and will not work on per-request serverless.
const g = globalThis as unknown as { __tiktokHub?: Map<string, Conn> };
const conns = (g.__tiktokHub ??= new Map<string, Conn>());

export function normalizeUsername(raw: string) {
  const u = raw.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?tiktok\.com\/@/i, "").split(/[/?]/)[0];
  if (!/^[a-z0-9._]{2,40}$/i.test(u)) throw new Error("Usuario de TikTok inválido");
  return u.toLowerCase();
}

function push(c: Conn, e: ChatEntry) {
  c.chat.push(e);
  if (c.chat.length > MAX_CHAT) c.chat.splice(0, c.chat.length - MAX_CHAT);
}

async function handleChat(c: Conn, comment: LiveComment) {
  const entry: ChatEntry = {
    id: comment.eventId,
    user: comment.user,
    text: comment.text,
    ts: comment.ts,
    result: "ignored",
  };
  try {
    const res = await ingestComment(c.sessionId, comment);
    entry.result = res.kind;
    if (res.kind === "claimed" || res.kind === "unknown_item") entry.code = res.code;
    if (res.kind === "claimed" && res.status === "PENDING") {
      const auto = await autoConfirmClaim(res.claimId);
      if (auto) entry.result = "auto_confirmed";
    }
    if (res.kind === "session_closed") await disconnect(c.sessionId);
  } catch (e) {
    console.error("TikTok comment handling failed:", e);
    entry.result = "failed";
  }
  push(c, entry);
}

function attach(c: Conn) {
  const connection = new TikTokLiveConnection(c.username, {
    signApiKey: process.env.TIKTOK_SIGN_API_KEY || undefined,
  });
  c.connection = connection;

  connection.on(WebcastEvent.CHAT, (data) => {
    const text = data.content ?? "";
    if (!text) return;
    const user = data.user?.displayId || data.user?.nickname || "desconocido";
    const ts = Number(data.common?.createTime ?? 0);
    void handleChat(c, {
      eventId: data.common?.msgId || `${user}-${ts}-${text}`,
      user,
      text,
      ts: ts > 0 ? ts : Date.now(),
    });
  });

  connection.on(WebcastEvent.ROOM_USER, (data) => {
    c.viewers = Number(data.totalUser) || c.viewers;
  });

  connection.on(WebcastEvent.STREAM_END, () => {
    c.wanted = false;
    c.status = "offline";
    c.error = "La transmisión de TikTok terminó";
  });

  connection.on(ControlEvent.DISCONNECTED, () => {
    if (!c.wanted) return;
    if (c.retries >= MAX_RETRIES) {
      c.status = "error";
      c.error = "Se perdió la conexión con TikTok";
      return;
    }
    c.status = "reconnecting";
    const delay = Math.min(30_000, 2_000 * 2 ** c.retries++);
    setTimeout(() => {
      if (c.wanted && conns.get(c.sessionId) === c) void start(c);
    }, delay);
  });

  connection.on(ControlEvent.ERROR, (err) => {
    console.error("TikTok connection error:", err);
  });
}

async function start(c: Conn) {
  await c.connection?.disconnect().catch(() => {});
  attach(c);
  try {
    await c.connection!.connect();
    c.status = "connected";
    c.error = undefined;
    c.retries = 0;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const offline = /offline|not.*live|UserOffline/i.test(`${(e as Error)?.name} ${msg}`);
    c.status = offline ? "offline" : "error";
    c.error = offline ? `@${c.username} no está transmitiendo en vivo ahora` : msg;
    c.wanted = false;
  }
}

export async function connect(sessionId: string, rawUsername: string): Promise<HubSnapshot> {
  const username = normalizeUsername(rawUsername);
  await connectDB();
  const session = await LiveSessionModel.findOneAndUpdate(
    { _id: sessionId, status: "ACTIVE" },
    { tiktokUsername: username },
  );
  if (!session) throw new Error("La transmisión no existe o ya está cerrada");

  const prev = conns.get(sessionId);
  if (prev) await disconnect(sessionId);

  const c: Conn = {
    sessionId,
    username,
    connection: null,
    status: "connecting",
    viewers: 0,
    chat: [],
    wanted: true,
    retries: 0,
  };
  conns.set(sessionId, c);
  await start(c);
  return snapshot(sessionId)!;
}

export async function disconnect(sessionId: string) {
  const c = conns.get(sessionId);
  if (!c) return;
  c.wanted = false;
  conns.delete(sessionId);
  await c.connection?.disconnect().catch(() => {});
}

export function snapshot(sessionId: string): HubSnapshot | null {
  const c = conns.get(sessionId);
  if (!c) return null;
  return {
    status: c.status,
    username: c.username,
    error: c.error,
    viewers: c.viewers,
    chat: c.chat.slice(-60),
  };
}
