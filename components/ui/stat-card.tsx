"use client";

import { useChangeType } from "@/lib/hooks/useChangeType";

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: number;
  icon: React.ReactNode;
  mode?: "default" | "money" | "percentage";
  active?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon,
  mode,
  subtitle,
  active,
}: StatCardProps) => {
  const changeType: number = useChangeType();

  return (
    <div className="relative p-5 rounded-2xl border border-border bg-card flex items-center justify-between max-w-xs w-full ">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text font-medium">
          {title.toUpperCase()}
        </p>
        <div
          className={`text-2xl font-bold mt-1 ${active ? "text-primary" : value < 0 ? "text-red-500" : "text-foreground"}`}
        >
          {mode === "money"
            ? `BOB${value.toLocaleString()}`
            : mode === "percentage"
              ? `${value}%`
              : value}
          {mode === "money" && (
            <span className="text-sm font-normal text-text">
              /{(value / changeType).toFixed(2)} $
            </span>
          )}
        </div>
        {subtitle && (
          <p className="font-mono text-[9px] uppercase mt-1 tracking-[0.2em] text-text text-xs">
            {subtitle}
          </p>
        )}
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-3.5 h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
};
