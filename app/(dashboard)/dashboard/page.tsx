import { ButtonComponent } from "@/components/ui/button-component";
import { Chart } from "@/components/ui/dashboard/chart";
import { WEEK_DAYS } from "@/components/ui/dashboard/week-days";
import { StatCard } from "@/components/ui/stat-card";
import { auth } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/services/metrics.service";
import { formatMoney } from "@/lib/utils/formatters";
import { Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

const card = "p-4 sm:p-6 rounded-2xl border border-border bg-card";
const heading = "font-mono text-[9px] uppercase mt-1 tracking-[0.2em] text-text";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  let m: Awaited<ReturnType<typeof getDashboardMetrics>> | null = null;
  let metricsError = false;
  if (isAdmin) {
    try {
      m = await getDashboardMetrics();
    } catch (error) {
      console.error("Error al cargar métricas:", error);
      metricsError = true;
    }
  }

  return (
    <div className="w-full">
      <div className="flex sm:justify-between sm:items-center gap-4 border-b border-primary-lighter w-full p-4 sm:p-6">
        <span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            ¡Hola, {user?.name || "Usuario"}!
          </h1>
          <p className="text-xs sm:text-sm text-text mt-1">
            Bienvenido a tu panel de control. Rol:{" "}
            <span className="font-semibold text-primary capitalize">{user?.role || "customer"}</span>
          </p>
        </span>
        {isAdmin && (
          <span className="shrink-0 hidden sm:flex gap-2">
            <Link href="/admin/live">
              <ButtonComponent label="En vivo" />
            </Link>
            <Link href="/admin/orders">
              <ButtonComponent label={`+  Nueva Venta`} />
            </Link>
          </span>
        )}
      </div>

      {!isAdmin && (
        <p className="p-6 text-sm text-text/70">
          Las métricas de ventas están disponibles para administradores.
        </p>
      )}
      {metricsError && (
        <p role="alert" className="p-6 text-sm text-danger">
          No se pudieron cargar las métricas. Intenta de nuevo en unos segundos.
        </p>
      )}

      {m && (
        <section className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            <StatCard
              title="Ingresos confirmados"
              value={m.sales.confirmedRevenue}
              subtitle={`${m.sales.paidCount} ventas pagadas`}
              icon={<TrendingUp className="h-5 w-5" />}
              mode="money"
              active
            />
            <StatCard
              title="Ingresos estimados"
              value={m.sales.estimatedRevenue}
              subtitle={`Por cobrar: ${formatMoney(m.sales.pendingAmount)}`}
              icon={<Package className="h-5 w-5" />}
              mode="money"
            />
            <StatCard
              title="Ventas pendientes de pago"
              value={m.sales.pendingCount}
              subtitle={`${m.pendingClaims} reclamos por confirmar`}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Prendas disponibles"
              value={m.inventory.available}
              subtitle={`Vendidas: ${m.inventory.sold}`}
              icon={<ShoppingBag className="h-5 w-5" />}
            />
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 w-full">
            <div className={`${card} lg:col-span-5`}>
              <h4 className={heading}>Ingresos estimados — semana en curso</h4>
              <Chart
                data={{
                  labels: [...WEEK_DAYS],
                  datasets: WEEK_DAYS.map((day, i) => ({ day, data: m.week[i].estimated })),
                }}
              />
            </div>

            <div className="flex flex-col gap-4 lg:col-span-3">
              <div className={card}>
                <h4 className={heading}>Pedidos pendientes de pago</h4>
                {m.pending.length === 0 ? (
                  <p className="text-sm text-text/60 mt-3">Todo al día.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-border">
                    {m.pending.map((p) => (
                      <li key={p.id} className="flex justify-between gap-2 py-1.5 text-sm">
                        <span className="truncate">{p.customer}</span>
                        <span className="font-mono shrink-0">{formatMoney(p.price)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={card}>
                <h4 className={heading}>Fardo vs unidad</h4>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {(
                    [
                      ["Fardos", m.channels.fardo],
                      ["Unidades", m.channels.unit],
                    ] as const
                  ).map(([label, c]) => (
                    <div key={label}>
                      <dt className="text-text/60 text-xs">{label}</dt>
                      <dd className="font-mono font-semibold">{formatMoney(c.revenue)}</dd>
                      <dd className="text-xs text-text/60">
                        {c.count} ventas · prom. {formatMoney(c.avgPrice)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base tracking-tight">Progreso de fardos</h3>
                <Link href="/admin/reports" className="text-[11px] text-primary font-mono hover:underline shrink-0">
                  Ver reportes →
                </Link>
              </div>
              {m.bales.length === 0 ? (
                <p className="text-sm text-text/60">Aún no hay fardos registrados.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {m.bales.slice(0, 4).map((b) => (
                    <div key={b.id} className="p-4 sm:p-5 rounded-2xl border border-border bg-background/50 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">
                            <span className="font-mono text-primary mr-1.5">{b.code}</span>
                            {b.name}
                          </h4>
                          <p className="text-xs text-text/70 mt-0.5">{b.piecesPerDay} piezas/día</p>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-mono font-semibold border border-border rounded-full shrink-0">
                          {b.marginPct === null ? "Sin ventas" : `Margen ${b.marginPct}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-border/60 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, b.sellThrough * 100)}%` }} />
                        </div>
                        <span className="font-mono text-[11px] text-text/70 shrink-0">
                          {b.sold}/{b.totalQuantity}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-text/60">
                        Inversión: {formatMoney(b.cost)} · Recuperado: {b.recoveredPct ?? 0}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      )}

      {isAdmin && (
        <span className="shrink-0 sm:hidden flex fixed bottom-4 right-4 z-40">
          <Link href="/admin/orders">
            <ButtonComponent label={`+  Nueva Venta`} />
          </Link>
        </span>
      )}
    </div>
  );
}
