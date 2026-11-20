"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  confirmClaimAction,
  createSessionAction,
  endSessionAction,
  listClaimsAction,
  listSessionsAction,
  markClaimPaidAction,
  reassignClaimAction,
  releaseClaimAction,
  sendCommentAction,
  simulateLiveAction,
} from "@/lib/actions/live.action";
import { getCustomersAction } from "@/lib/actions/customer.actions";
import type { ClaimStatus } from "@/lib/domain/claims";

interface Session {
  _id: string;
  name: string;
  status: "ACTIVE" | "ENDED";
}
interface Claim {
  _id: string;
  user: string;
  code: string;
  ts: number;
  status: ClaimStatus;
  garmentName: string;
  garmentPrice: number;
}
interface Customer {
  _id: string;
  name: string;
  lastname: string;
}

const STATUS_LABEL: Record<ClaimStatus, string> = {
  PENDING: "Pendiente",
  QUEUED: "En cola",
  CONFIRMED: "Confirmado",
  PAID: "Pagado",
  RELEASED: "Liberado",
};

const btn =
  "px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-background disabled:opacity-50";
const btnPrimary =
  "px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50";

export default function LiveClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerFor, setCustomerFor] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [user, setUser] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const session = sessions.find((s) => s._id === sessionId);

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Initial load and reload after session changes (tick).
  useEffect(() => {
    let cancelled = false;
    void listSessionsAction().then((res) => {
      if (cancelled) return;
      if (!res.success) return setError(res.error);
      setSessions(res.data);
      setSessionId((cur) => cur || res.data[0]?._id || "");
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  useEffect(() => {
    let cancelled = false;
    void getCustomersAction().then((r) => {
      if (!cancelled && r.success) setCustomers(r.data as Customer[]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Claims: load now, then poll while the tab is visible and the stream is active.
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const load = () =>
      listClaimsAction(sessionId).then((res) => {
        if (cancelled) return;
        if (res.success) setClaims(res.data);
        else setError(res.error);
      });
    void load();
    if (session?.status !== "ACTIVE") return () => void (cancelled = true);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sessionId, session?.status, tick]);

  const act = (fn: () => Promise<{ success: boolean; error?: string }>) =>
    startTransition(async () => {
      setError("");
      const res = await fn();
      if (!res.success) setError(res.error ?? "Error");
      refresh();
    });

  // Group by item: holder first, then the queue ordered by arrival time.
  const groups = useMemo(() => {
    const map = new Map<string, Claim[]>();
    for (const c of claims) {
      if (c.status === "RELEASED") continue;
      map.set(c.code, [...(map.get(c.code) ?? []), c]);
    }
    return [...map.entries()].map(([code, list]) => ({
      code,
      holder: list.find((c) => c.status !== "QUEUED"),
      queue: list.filter((c) => c.status === "QUEUED").sort((a, b) => a.ts - b.ts),
    }));
  }, [claims]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm rounded-lg border border-border bg-surface p-3 text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 bg-surface border border-border rounded-xl p-3">
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text"
          aria-label="Transmisión"
        >
          {sessions.length === 0 && <option value="">Sin transmisiones</option>}
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} {s.status === "ENDED" ? "(cerrada)" : ""}
            </option>
          ))}
        </select>
        {session?.status === "ACTIVE" && (
          <button
            className={btn}
            disabled={pending}
            onClick={() =>
              act(async () => {
                const r = await endSessionAction(session._id);
                refresh();
                return r;
              })
            }
          >
            Cerrar transmisión
          </button>
        )}
        <form
          className="flex gap-2 ml-auto"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newName.trim()) return;
            act(async () => {
              const r = await createSessionAction(newName);
              if (r.success) {
                setNewName("");
                refresh();
                setSessionId(r.data._id);
              }
              return r;
            });
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de nueva transmisión"
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text"
          />
          <button className={btnPrimary} disabled={pending}>
            Crear
          </button>
        </form>
      </div>

      {session?.status === "ACTIVE" && (
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-text/60">Simulador (modo prueba)</p>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              act(async () => {
                const r = await sendCommentAction(session._id, user, text);
                if (r.success) setText("");
                return r;
              });
            }}
          >
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="usuario"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text w-32"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="mío A1"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text flex-1 min-w-40"
            />
            <button className={btnPrimary} disabled={pending}>
              Enviar comentario
            </button>
            <button type="button" className={btn} disabled={pending} onClick={() => act(() => simulateLiveAction(session._id, "batch", 10))}>
              Simular 10
            </button>
            <button type="button" className={btn} disabled={pending} onClick={() => act(() => simulateLiveAction(session._id, "race"))}>
              Simular carrera
            </button>
          </form>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-sm text-text/60 text-center py-10">Aún no hay reclamos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map(({ code, holder, queue }) => (
            <li key={code} className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-primary text-lg">{code}</span>
                <span className="text-sm text-text/70">{holder?.garmentName ?? queue[0]?.garmentName}</span>
                {holder && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full border border-border">
                    {STATUS_LABEL[holder.status]}
                  </span>
                )}
              </div>

              {holder && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-text">@{holder.user}</span>
                  <span className="text-xs text-text/50">{new Date(holder.ts).toLocaleTimeString()}</span>
                  <div className="flex flex-wrap gap-2 ml-auto">
                    {holder.status === "PENDING" && (
                      <>
                        <select
                          value={customerFor[holder._id] ?? ""}
                          onChange={(e) => setCustomerFor((m) => ({ ...m, [holder._id]: e.target.value }))}
                          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-text max-w-44"
                          aria-label="Cliente"
                        >
                          <option value="">Cliente…</option>
                          {customers.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name} {c.lastname}
                            </option>
                          ))}
                        </select>
                        <button
                          className={btnPrimary}
                          disabled={pending || !customerFor[holder._id]}
                          onClick={() => act(() => confirmClaimAction(holder._id, customerFor[holder._id]))}
                        >
                          Confirmar
                        </button>
                      </>
                    )}
                    {holder.status === "CONFIRMED" && (
                      <button className={btnPrimary} disabled={pending} onClick={() => act(() => markClaimPaidAction(holder._id))}>
                        Marcar pagado
                      </button>
                    )}
                    {(holder.status === "PENDING" || holder.status === "CONFIRMED") && (
                      <button className={btn} disabled={pending} onClick={() => act(() => releaseClaimAction(holder._id))}>
                        Liberar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {queue.length > 0 && (
                <ul className="border-t border-border pt-2 flex flex-col gap-1">
                  {queue.map((q, i) => (
                    <li key={q._id} className="flex items-center gap-2 text-xs text-text/70">
                      <span>#{i + 1} en cola</span>
                      <span className="font-medium text-text">@{q.user}</span>
                      <span>{new Date(q.ts).toLocaleTimeString()}</span>
                      {holder && (holder.status === "PENDING" || holder.status === "CONFIRMED") && (
                        <button className={`${btn} ml-auto`} disabled={pending} onClick={() => act(() => reassignClaimAction(holder._id, q._id))}>
                          Asignar a este
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
