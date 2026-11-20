"use client";

import { useEffect, useState } from "react";

const KEY_RATE = "changeType";
const KEY_DATE = "changeTypeDate";

/** Day key in Bolivia time (UTC-4), so the cache flips at local midnight. */
const localDay = () => new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10);

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const parseRate = (raw: string | null): number => {
  if (!raw) return 0;
  try {
    const n = Number(JSON.parse(raw));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
};

// One in-flight request shared by every StatCard on the page.
let inflight: Promise<number> | null = null;

async function fetchRate(): Promise<number> {
  const today = localDay();
  const cached = parseRate(read(KEY_RATE));
  if (cached && read(KEY_DATE) === today) return cached;

  const base = process.env.NEXT_PUBLIC_CUCU_API_URL;
  if (!base) return cached;

  try {
    const res = await fetch(`${base}/tc/oficial`, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rate = Number((await res.json())?.tc_oficial?.base);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid rate");
    try {
      localStorage.setItem(KEY_RATE, JSON.stringify(rate));
      localStorage.setItem(KEY_DATE, today);
    } catch {}
    return rate;
  } catch (error) {
    console.error("Error al obtener el tipo de cambio:", error);
    return cached; // stale rate, or 0 when unknown
  }
}

/** Official BOB→USD rate, or 0 while loading / unavailable. Callers must treat 0 as "unknown". */
export const useChangeType = () => {
  const [rate, setRate] = useState(0);

  useEffect(() => {
    let cancelled = false;
    inflight ??= fetchRate().finally(() => {
      inflight = null;
    });
    void inflight.then((r) => {
      if (!cancelled) setRate(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return rate;
};
