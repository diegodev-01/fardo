"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Switch } from "@/components/ui/form/Switch";
import { Package, Radio, Truck, ArrowRight, LogIn } from "lucide-react";

const FEATURES = [
  {
    icon: Package,
    title: "Clasifica tus fardos",
    description:
      "Registra cada fardo apenas llega: prendas, tallas y precio sugerido, listos para vender en minutos.",
  },
  {
    icon: Radio,
    title: "Pedidos en tiempo real",
    description:
      "Durante tu Live, cada comentario de compra se convierte en un pedido ordenado, sin perder ni una venta en el caos del chat.",
  },
  {
    icon: Truck,
    title: "Entregas sin enredos",
    description:
      "Organiza direcciones, pagos y estados de entrega en un solo lugar, del carrito de TikTok hasta la puerta del cliente.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Cargas tus fardos",
    description: "Clasifica lo que llega antes de salir en vivo.",
  },
  {
    number: "02",
    title: "Vendes en tu Live",
    description: "Cada comentario se transforma en pedido automáticamente.",
  },
  {
    number: "03",
    title: "Coordinas la entrega",
    description: "Confirmas pago y despacho sin salir de la app.",
  },
];

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-6xl mx-auto">
        <span className="text-xl font-extrabold tracking-tight">Mío!</span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text font-medium">
            {isDark ? "Oscuro" : "Claro"}
          </span>
          <Switch
            checked={isDark}
            onChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 sm:px-10">
        <section className="flex flex-col items-center text-center gap-6 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Gestión de Fardos & Ventas TikTok
          </span>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-3xl">
            Tu Live, ordenado de principio a fin
          </h1>

          <p className="text-lg text-text max-w-xl">
            Clasifica fardos de ropa, gestiona pedidos en tiempo real durante
            tus Lives de TikTok y coordina entregas sin enredos, todo desde un
            mismo lugar.
          </p>

          <div className="flex flex-col items-center gap-3 mt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 justify-center px-7 py-3 text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Link>
            <span className="text-xs text-text">
              ¿No tienes cuenta? Contacta a tu administrador para obtener
              acceso.
            </span>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border">
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary-light transition-colors duration-200"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-text leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16 border-t border-border">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Cómo funciona
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {STEPS.map(({ number, title, description }, i) => (
              <div key={number} className="relative flex flex-col gap-2">
                <span className="text-sm font-mono text-primary font-semibold">
                  {number}
                </span>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-text leading-relaxed">
                  {description}
                </p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden sm:block absolute -right-8 top-1 h-4 w-4 text-primary-light" />
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text">
          <span>
            © {new Date().getFullYear()} Mío! Todos los derechos reservados.
          </span>
          <span>Hecho para vendedoras y vendedores de Live en TikTok.</span>
        </div>
      </footer>
    </div>
  );
}
