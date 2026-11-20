import { describe, expect, it } from "vitest";
import {
  attributeSales, balePerformance, channelComparison, inventorySummary, pendingOrders,
  summarizeSales, topBuyers, topCommenters, weekStart, weeklyRevenue,
  type BaleRow, type SaleRow,
} from "./metrics";

const DAY = 86_400_000;
const sale = (o: Partial<SaleRow>): SaleRow => ({
  id: "s", garmentId: "g", customerId: "c1", price: 100, paymentState: "PENDIENTE", createdAt: 0, ...o,
});
const bale = (o: Partial<BaleRow>): BaleRow => ({
  id: "b1", code: "A", name: "Fardo A", cost: 500, sendCost: 50, totalQuantity: 10, currentPieces: 6, createdAt: 0, ...o,
});

describe("summarizeSales", () => {
  it("separates estimated, confirmed, pending and ignores cancelled", () => {
    const r = summarizeSales([
      sale({ price: 100, paymentState: "PAGADO" }),
      sale({ price: 50 }),
      sale({ price: 999, paymentState: "CANCELADO" }),
    ]);
    expect(r).toMatchObject({ salesCount: 2, estimatedRevenue: 150, confirmedRevenue: 100, pendingAmount: 50, cancelledCount: 1 });
  });
  it("handles empty", () => expect(summarizeSales([]).estimatedRevenue).toBe(0));
});

describe("attributeSales", () => {
  it("fills baleId from the garment for legacy sales", () => {
    const [s] = attributeSales([sale({ garmentId: "g1" })], [{ id: "g1", baleId: "b1", quantity: 1, isSold: true }]);
    expect(s.baleId).toBe("b1");
  });
});

describe("inventorySummary", () => {
  it("does not double count bale garments", () => {
    const r = inventorySummary(
      [
        { id: "1", quantity: 2, isSold: true },
        { id: "2", quantity: 3, isSold: false },
        { id: "3", baleId: "b1", quantity: 5, isSold: false },
      ],
      [bale({})],
    );
    expect(r.loose).toEqual({ sold: 2, available: 3 });
    expect(r.bales).toEqual({ total: 10, remaining: 6, sold: 4 });
    expect(r.sold).toBe(6);
    expect(r.available).toBe(9);
  });
});

describe("balePerformance", () => {
  it("computes margin, sell-through and velocity; ranks fastest first", () => {
    const now = 5 * DAY;
    const rows = balePerformance(
      [bale({}), bale({ id: "b2", code: "B", currentPieces: 10, totalQuantity: 10 })],
      [sale({ baleId: "b1", price: 400, paymentState: "PAGADO" }), sale({ baleId: "b1", price: 300 }), sale({ baleId: "b1", price: 9, paymentState: "CANCELADO" })],
      now,
    );
    expect(rows[0]).toMatchObject({ code: "A", sold: 4, sellThrough: 0.4, revenue: 700, confirmed: 400, cost: 550, profit: 150, piecesPerDay: 0.8 });
    expect(rows[0].marginPct).toBeCloseTo(21.43, 2);
    expect(rows[0].recoveredPct).toBeCloseTo(72.73, 2);
    expect(rows[1]).toMatchObject({ code: "B", marginPct: null, sold: 0 });
  });
  it("never divides by zero", () => {
    const [r] = balePerformance([bale({ totalQuantity: 0, currentPieces: 0, cost: 0, sendCost: 0 })], [], 0);
    expect(r.sellThrough).toBe(0);
    expect(r.recoveredPct).toBeNull();
  });
});

describe("channelComparison", () => {
  it("splits fardo vs unit", () => {
    const r = channelComparison([sale({ baleId: "b1", price: 100 }), sale({ price: 30 }), sale({ price: 50 })]);
    expect(r.fardo).toEqual({ count: 1, revenue: 100, avgPrice: 100 });
    expect(r.unit).toEqual({ count: 2, revenue: 80, avgPrice: 40 });
  });
});

describe("rankings", () => {
  it("top buyers by total, with pending", () => {
    const r = topBuyers(
      [sale({ customerId: "a", price: 10 }), sale({ customerId: "b", price: 90, paymentState: "PAGADO" }), sale({ customerId: "a", price: 5, paymentState: "CANCELADO" })],
      new Map([["a", "Ana"], ["b", "Beto"]]),
    );
    expect(r.map((x) => x.name)).toEqual(["Beto", "Ana"]);
    expect(r[1]).toMatchObject({ orders: 1, total: 10, pending: 10 });
  });
  it("top commenters", () => {
    const r = topCommenters([
      { user: "x", status: "PAID" }, { user: "x", status: "QUEUED" }, { user: "y", status: "PENDING" },
    ]);
    expect(r[0]).toEqual({ user: "x", claims: 2, won: 1 });
  });
  it("pending orders oldest first", () => {
    const r = pendingOrders([sale({ id: "2", createdAt: 20 }), sale({ id: "1", createdAt: 10 }), sale({ id: "3", paymentState: "PAGADO" })]);
    expect(r.map((s) => s.id)).toEqual(["1", "2"]);
  });
});

describe("weekly revenue (UTC-4)", () => {
  // 2026-11-18 is a Wednesday. Monday 2026-11-16 00:00 Bolivia = 04:00 UTC.
  const wed = Date.UTC(2026, 10, 18, 15, 0, 0);
  const mon0 = Date.UTC(2026, 10, 16, 4, 0, 0);
  it("finds Monday 00:00 local", () => expect(weekStart(wed)).toBe(mon0));
  it("buckets by local weekday, not UTC", () => {
    const r = weeklyRevenue(
      [
        sale({ createdAt: mon0 + 1000, price: 10, paymentState: "PAGADO" }),
        sale({ createdAt: mon0 - 1000, price: 99 }), // Sunday night local: previous week
        sale({ createdAt: Date.UTC(2026, 10, 19, 2, 0, 0), price: 5 }), // Wed 22:00 local
        sale({ createdAt: mon0 + 7 * DAY, price: 77 }), // next week
      ],
      wed,
    );
    expect(r[0]).toEqual({ estimated: 10, confirmed: 10 });
    expect(r[2]).toEqual({ estimated: 5, confirmed: 0 });
    expect(r.reduce((n, d) => n + d.estimated, 0)).toBe(15);
  });
});
