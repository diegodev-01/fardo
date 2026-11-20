"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastKind = "error" | "success" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const COLORS: Record<ToastKind, string> = {
  error: "border-danger text-danger",
  success: "border-emerald-500 text-emerald-600",
  info: "border-border text-text",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = nextId.current++;
    setItems((cur) => [...cur.slice(-3), { id, kind, message }]);
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 5000);
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(92vw,24rem)] pointer-events-none"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto rounded-xl border bg-card px-4 py-3 text-sm shadow-lg ${COLORS[t.kind]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
