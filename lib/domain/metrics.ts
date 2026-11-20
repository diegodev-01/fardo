/**
 * Pure aggregations over already-fetched rows. No I/O, so every number on the
 * dashboard is unit-tested. Money is in the shop's currency (BOB).
 *
 * Revenue definitions:
 *   estimated = every non-cancelled sale (pending + paid)
 *   confirmed = paid sales only
 */

export type PaymentState = "PENDIENTE" | "PAGADO" | "CANCELADO";

export interface SaleRow {
  id: string;
  garmentId: string;
  customerId: string;
  baleId?: string;
  price: number;
  paymentState: PaymentState;
  /** epoch ms */
  createdAt: number;
}
export interface GarmentRow {
  id: string;
  baleId?: string;
  quantity: number;
  isSold: boolean;
}
export interface BaleRow {
  id: string;
  code: string;
  name: string;
  /** purchase cost of the whole bale */
  cost: number;
  sendCost: number;
  totalQuantity: number;
  currentPieces: number;
  createdAt: number;
}
export interface ClaimRow {
  user: string;
  status: "PENDING" | "QUEUED" | "CONFIRMED" | "PAID" | "RELEASED";
}

const DAY_MS = 86_400_000;
const round2 = (n: number) => Math.round(n * 100) / 100;
const live = (s: SaleRow) => s.paymentState !== "CANCELADO";

/** Older sales have no baleId: recover it from the garment that was sold. */
export function attributeSales(sales: SaleRow[], garments: GarmentRow[]): SaleRow[] {
  const baleOf = new Map(garments.map((g) => [g.id, g.baleId]));
  return sales.map((s) => (s.baleId ? s : { ...s, baleId: baleOf.get(s.garmentId) || undefined }));
}

export function summarizeSales(sales: SaleRow[]) {
  let estimatedRevenue = 0;
  let confirmedRevenue = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  let paidCount = 0;
  let cancelledCount = 0;
  for (const s of sales) {
    if (!live(s)) {
      cancelledCount++;
      continue;
    }
    estimatedRevenue += s.price;
    if (s.paymentState === "PAGADO") {
      confirmedRevenue += s.price;
      paidCount++;
    } else {
      pendingAmount += s.price;
      pendingCount++;
    }
  }
  return {
    salesCount: paidCount + pendingCount,
    estimatedRevenue: round2(estimatedRevenue),
    confirmedRevenue: round2(confirmedRevenue),
    pendingAmount: round2(pendingAmount),
    pendingCount,
    paidCount,
    cancelledCount,
  };
}

/**
 * Bale pieces and loose units are reported separately: a garment carved out of
 * a bale is still counted inside that bale's stock until it sells.
 */
export function inventorySummary(garments: GarmentRow[], bales: BaleRow[]) {
  const loose = garments.filter((g) => !g.baleId);
  const sum = (rows: GarmentRow[]) => rows.reduce((n, g) => n + g.quantity, 0);
  const looseSold = sum(loose.filter((g) => g.isSold));
  const looseAvailable = sum(loose.filter((g) => !g.isSold));
  const balePieces = bales.reduce((n, b) => n + b.totalQuantity, 0);
  const baleRemaining = bales.reduce((n, b) => n + b.currentPieces, 0);
  return {
    loose: { sold: looseSold, available: looseAvailable },
    bales: { total: balePieces, remaining: baleRemaining, sold: balePieces - baleRemaining },
    sold: looseSold + (balePieces - baleRemaining),
    available: looseAvailable + baleRemaining,
  };
}

export function balePerformance(bales: BaleRow[], sales: SaleRow[], now: number) {
  const byBale = new Map<string, SaleRow[]>();
  for (const s of sales) {
    if (!s.baleId || !live(s)) continue;
    byBale.set(s.baleId, [...(byBale.get(s.baleId) ?? []), s]);
  }
  return bales
    .map((b) => {
      const rows = byBale.get(b.id) ?? [];
      const revenue = rows.reduce((n, s) => n + s.price, 0);
      const confirmed = rows.filter((s) => s.paymentState === "PAGADO").reduce((n, s) => n + s.price, 0);
      const cost = b.cost + b.sendCost;
      const sold = Math.max(0, b.totalQuantity - b.currentPieces);
      const days = Math.max(1, (now - b.createdAt) / DAY_MS);
      return {
        id: b.id,
        code: b.code,
        name: b.name,
        totalQuantity: b.totalQuantity,
        sold,
        sellThrough: b.totalQuantity > 0 ? round2(sold / b.totalQuantity) : 0,
        revenue: round2(revenue),
        confirmed: round2(confirmed),
        cost: round2(cost),
        profit: round2(revenue - cost),
        /** null until something sold: a margin on zero revenue is meaningless */
        marginPct: revenue > 0 ? round2(((revenue - cost) / revenue) * 100) : null,
        recoveredPct: cost > 0 ? round2((confirmed / cost) * 100) : null,
        piecesPerDay: round2(sold / days),
      };
    })
    .sort((a, b) => b.piecesPerDay - a.piecesPerDay || b.sold - a.sold);
}

/** Fardo (bale pieces) vs unit (loose garments). Units carry no cost, so no margin. */
export function channelComparison(sales: SaleRow[]) {
  const acc = {
    fardo: { count: 0, revenue: 0 },
    unit: { count: 0, revenue: 0 },
  };
  for (const s of sales) {
    if (!live(s)) continue;
    const ch = s.baleId ? acc.fardo : acc.unit;
    ch.count++;
    ch.revenue += s.price;
  }
  const fin = (c: { count: number; revenue: number }) => ({
    count: c.count,
    revenue: round2(c.revenue),
    avgPrice: c.count ? round2(c.revenue / c.count) : 0,
  });
  return { fardo: fin(acc.fardo), unit: fin(acc.unit) };
}

export function topBuyers(
  sales: SaleRow[],
  names: Map<string, string>,
  limit = 5,
) {
  const by = new Map<string, { orders: number; total: number; pending: number }>();
  for (const s of sales) {
    if (!live(s)) continue;
    const cur = by.get(s.customerId) ?? { orders: 0, total: 0, pending: 0 };
    cur.orders++;
    cur.total += s.price;
    if (s.paymentState === "PENDIENTE") cur.pending += s.price;
    by.set(s.customerId, cur);
  }
  return [...by.entries()]
    .map(([id, v]) => ({
      customerId: id,
      name: names.get(id) ?? "Cliente eliminado",
      orders: v.orders,
      total: round2(v.total),
      pending: round2(v.pending),
    }))
    .sort((a, b) => b.total - a.total || b.orders - a.orders)
    .slice(0, limit);
}

export function topCommenters(claims: ClaimRow[], limit = 5) {
  const by = new Map<string, { claims: number; won: number }>();
  for (const c of claims) {
    const cur = by.get(c.user) ?? { claims: 0, won: 0 };
    cur.claims++;
    if (c.status === "CONFIRMED" || c.status === "PAID") cur.won++;
    by.set(c.user, cur);
  }
  return [...by.entries()]
    .map(([user, v]) => ({ user, ...v }))
    .sort((a, b) => b.claims - a.claims || b.won - a.won)
    .slice(0, limit);
}

export function pendingOrders(sales: SaleRow[], limit = 8) {
  return sales
    .filter((s) => s.paymentState === "PENDIENTE")
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, limit);
}

/** Bolivia is UTC-4 all year (no DST). */
export const BOLIVIA_OFFSET_MIN = -240;

/** Monday=0 … Sunday=6 for the given instant in the shop's timezone. */
export function weekdayIndex(ts: number, offsetMin = BOLIVIA_OFFSET_MIN): number {
  const local = new Date(ts + offsetMin * 60_000);
  return (local.getUTCDay() + 6) % 7;
}

/** Epoch ms of local Monday 00:00 of the week containing `now`. */
export function weekStart(now: number, offsetMin = BOLIVIA_OFFSET_MIN): number {
  const local = now + offsetMin * 60_000;
  const midnight = local - (((local % DAY_MS) + DAY_MS) % DAY_MS);
  return midnight - weekdayIndex(now, offsetMin) * DAY_MS - offsetMin * 60_000;
}

/** Revenue per weekday (Mon..Sun) for the current week. */
export function weeklyRevenue(sales: SaleRow[], now: number, offsetMin = BOLIVIA_OFFSET_MIN) {
  const start = weekStart(now, offsetMin);
  const days = Array.from({ length: 7 }, () => ({ estimated: 0, confirmed: 0 }));
  for (const s of sales) {
    if (!live(s) || s.createdAt < start || s.createdAt >= start + 7 * DAY_MS) continue;
    const d = days[weekdayIndex(s.createdAt, offsetMin)];
    d.estimated += s.price;
    if (s.paymentState === "PAGADO") d.confirmed += s.price;
  }
  return days.map((d) => ({ estimated: round2(d.estimated), confirmed: round2(d.confirmed) }));
}
