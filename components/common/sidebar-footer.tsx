"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/form/Switch";
import { LogOut, Sun, Moon } from "lucide-react";

interface SidebarFooterProps {
  userName?: string;
  userRole?: string;
  onSignOut: () => Promise<void>;
}

export function SidebarFooter({
  userName,
  userRole,
  onSignOut,
}: SidebarFooterProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="p-4 border-t border-border flex flex-col gap-4">
      {/* Selector de Tema */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-background/50 border border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-text">
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-primary" />
          )}
          <span>
            {mounted ? (isDark ? "Modo Oscuro" : "Modo Claro") : "Tema"}
          </span>
        </div>
        {mounted && (
          <Switch
            checked={isDark}
            onChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        )}
      </div>

      {/* Info de Usuario */}
      <div className="flex items-center gap-3 px-2">
        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
          {userName?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex flex-col truncate">
          <span className="text-sm font-semibold truncate">
            {userName || "Usuario"}
          </span>
          <span className="text-xs text-text capitalize">
            {userRole || "Cliente"}
          </span>
        </div>
      </div>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={() => onSignOut()}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}
