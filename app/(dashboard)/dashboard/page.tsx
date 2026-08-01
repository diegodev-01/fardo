import { ButtonComponent } from "@/components/ui/button-component";
import { Chart } from "@/components/ui/dashboard/chart";
import { StatCard } from "@/components/ui/stat-card";
import { auth } from "@/lib/auth";
import { Package, ShoppingBag, TrendingUp, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center border-b border-primary-lighter w-full p-6 ">
        <span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            ¡Hola, {user?.name || "Usuario"}!
          </h1>
          <p className="text-sm text-text mt-1">
            Bienvenido a tu panel de control. Rol:
            <span className="font-semibold text-primary capitalize">
              {user?.role || "customer"}
            </span>
          </p>
        </span>
        <span>
          <ButtonComponent label={`+\u00A0\u00A0Nueva Venta`} />
        </span>
      </div>
      <section className="p-4 sm:p-6 lg:p-10 space-y-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full justify-items-center">
          <StatCard
            title="Ganancia del día"
            value={12}
            subtitle="↑ 10% más que ayer"
            icon={<TrendingUp className="h-5 w-5" />}
            mode="money"
            active
          />

          <StatCard
            title="Utilidad Neta"
            value={75}
            subtitle="Margen: 39%"
            icon={<Package className="h-5 w-5" />}
            mode="money"
          />
          <StatCard
            title="Entregas pendientes"
            value={1}
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            title="prendas disponibles"
            value={75}
            icon={<ShoppingBag className="h-5 w-5" />}
          />
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 w-full">
          <div className="p-12 rounded-2xl border border-border bg-card sm:p-10 lg:col-span-5">
            <h4 className="font-mono text-[9px] uppercase mt-1 tracking-[0.2em] text-text text-xs">
              Ingresos vs Utilidad - Semana en curso
            </h4>
            <div>
              <Chart />
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="p-12 rounded-2xl border border-border bg-card sm:p-10">
              <h4 className=" font-mono text-[9px] uppercase mt-1 tracking-[0.2em] text-text text-xs">
                Pedidos Pendientes
              </h4>
            </div>
            <div className="p-12 rounded-2xl border border-border bg-card sm:p-10">
              <h4 className="font-mono text-[9px] uppercase mt-1 tracking-[0.2em] text-text text-xs">
                Resumen de la semana
              </h4>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Cabecera de la sección */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground tracking-tight">
                Progreso de Pacas
              </h3>
              <button className="text-[11px] text-primary font-mono hover:underline">
                Ver inventario →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-background/50 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      B-2024-047
                    </h4>
                    <p className="text-xs text-text opacity-70 mt-0.5">
                      Ropa USA Imports
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    Activo
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-2 bg-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(8 / 85) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-text opacity-70">
                    8/85
                  </span>
                </div>

                <p className="font-mono text-[11px] text-text opacity-60 mt-1">
                  Inversión: $3.200
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-background/50 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      B-2024-045
                    </h4>
                    <p className="text-xs text-text opacity-70 mt-0.5">
                      Ropa USA Imports
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-semibold text-purple-600 bg-purple-500/10 border border-purple-500/20 rounded-full">
                    Nuevo
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-2 bg-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-text opacity-70">
                    0/70
                  </span>
                </div>

                <p className="font-mono text-[11px] text-text opacity-60 mt-1">
                  Inversión: $2.800
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
