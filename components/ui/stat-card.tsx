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
    <div className="relative p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border bg-card flex items-center justify-between w-full max-w-full sm:max-w-xs">
      <div className="min-w-0">
        <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
          {title.toUpperCase()}
        </p>
        <div
          className={`text-lg sm:text-2xl font-bold mt-1 truncate ${
            active
              ? "text-primary"
              : value < 0
                ? "text-red-500"
                : "text-foreground"
          }`}
        >
          {mode === "money"
            ? `BOB${value.toLocaleString()}`
            : mode === "percentage"
              ? `${value}%`
              : value}
          {mode === "money" && (
            <span className="text-xs sm:text-sm font-normal text-text">
              /{(value / changeType).toFixed(2)} $
            </span>
          )}
        </div>
        {subtitle && (
          <p className="font-mono text-[8px] sm:text-[9px] uppercase mt-1 tracking-[0.15em] sm:tracking-[0.2em] text-text truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2.5 sm:right-3.5 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
        {icon}
      </div>
    </div>
  );
};
