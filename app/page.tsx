"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Switch } from "@/components/ui/form/Switch";

export default function Home() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center font-sans bg-background text-foreground relative p-4">
      {/* Switch de Tema en la esquina superior */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">
          {isDark ? "Oscuro" : "Claro"}
        </span>
        <Switch
          checked={isDark}
          onChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>

      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-20 px-8 text-center sm:items-start sm:text-left gap-6">
        {/* Título y Presentación */}
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            ⚡ Gestión de Fardos & Ventas TikTok
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Mío!
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            La plataforma para clasificar fardos de ropa, gestionar pedidos en
            tiempo real durante tus Lives y coordinar entregas sin enredos.
          </p>
        </div>

        {/* Botones de Acción principales */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all duration-200"
          >
            Iniciar Sesión
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold border border-border bg-card hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-200"
          >
            Crear Cuenta
          </Link>
        </div>
      </main>
    </div>
  );
}
