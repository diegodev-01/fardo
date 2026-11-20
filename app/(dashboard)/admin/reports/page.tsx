import { getDashboardMetrics } from "@/lib/services/metrics.service";
import { formatMoney } from "@/lib/utils/formatters";

export const dynamic = "force-dynamic";

const card = "p-4 sm:p-6 rounded-2xl border border-border bg-card";
const heading = "font-mono text-[9px] uppercase tracking-[0.2em] text-text mb-3";
const th = "text-left font-medium text-text/60 px-2 py-2 whitespace-nowrap";
const td = "px-2 py-2 whitespace-nowrap";

export default async function ReportsPage() {
  let m;
  try {
    m = await getDashboardMetrics();
  } catch (error) {
    console.error("Error al cargar reportes:", error);
    return (
      <p role="alert" className="p-6 text-sm text-danger">
        No se pudieron cargar los reportes. Intenta de nuevo en unos segundos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 w-full">
      <div>
        <h1 className="text-2xl font-bold">Reportes y ventas</h1>
        <p className="text-sm text-text/60 mt-1">
          Ingresos estimados = ventas no canceladas; confirmados = solo pagadas. Actualizado{" "}
          {new Date(m.generatedAt).toLocaleTimeString("es-BO")}.
        </p>
      </div>

      <section className={card}>
        <h2 className={heading}>Rendimiento por fardo (más rápidos primero)</h2>
        {m.bales.length === 0 ? (
          <p className="text-sm text-text/60">Sin fardos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["Fardo", "Vendidas", "Rotación", "Piezas/día", "Ingresos", "Cobrado", "Costo", "Ganancia", "Margen", "Recuperado"].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {m.bales.map((b) => (
                  <tr key={b.id}>
                    <td className={`${td} font-sans`}>
                      <span className="font-bold text-primary mr-1.5">{b.code}</span>
                      {b.name}
                    </td>
                    <td className={td}>
                      {b.sold}/{b.totalQuantity}
                    </td>
                    <td className={td}>{Math.round(b.sellThrough * 100)}%</td>
                    <td className={td}>{b.piecesPerDay}</td>
                    <td className={td}>{formatMoney(b.revenue)}</td>
                    <td className={td}>{formatMoney(b.confirmed)}</td>
                    <td className={td}>{formatMoney(b.cost)}</td>
                    <td className={`${td} ${b.profit < 0 ? "text-danger" : ""}`}>{formatMoney(b.profit)}</td>
                    <td className={td}>{b.marginPct === null ? "—" : `${b.marginPct}%`}</td>
                    <td className={td}>{b.recoveredPct === null ? "—" : `${b.recoveredPct}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className={card}>
          <h2 className={heading}>Fardo vs unidad</h2>
          <ul className="text-sm space-y-3">
            {(
              [
                ["Piezas de fardo", m.channels.fardo, `${m.inventory.bales.sold}/${m.inventory.bales.total} vendidas`],
                ["Unidades sueltas", m.channels.unit, `${m.inventory.loose.sold} vendidas, ${m.inventory.loose.available} disponibles`],
              ] as const
            ).map(([label, c, stock]) => (
              <li key={label}>
                <p className="font-medium">{label}</p>
                <p className="font-mono">{formatMoney(c.revenue)}</p>
                <p className="text-xs text-text/60">
                  {c.count} ventas · prom. {formatMoney(c.avgPrice)} · {stock}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <h2 className={heading}>Mejores compradores</h2>
          {m.topBuyers.length === 0 ? (
            <p className="text-sm text-text/60">Sin ventas.</p>
          ) : (
            <ol className="text-sm divide-y divide-border">
              {m.topBuyers.map((b, i) => (
                <li key={b.customerId} className="flex justify-between gap-2 py-1.5">
                  <span className="truncate">
                    {i + 1}. {b.name}
                  </span>
                  <span className="font-mono shrink-0">
                    {formatMoney(b.total)}
                    {b.pending > 0 && <span className="text-text/50"> ({formatMoney(b.pending)} pend.)</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={card}>
          <h2 className={heading}>Comentaristas más activos</h2>
          {m.topCommenters.length === 0 ? (
            <p className="text-sm text-text/60">Sin actividad en vivo.</p>
          ) : (
            <ol className="text-sm divide-y divide-border">
              {m.topCommenters.map((c, i) => (
                <li key={c.user} className="flex justify-between gap-2 py-1.5">
                  <span className="truncate">
                    {i + 1}. @{c.user}
                  </span>
                  <span className="font-mono shrink-0">
                    {c.claims} reclamos · {c.won} ganados
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
