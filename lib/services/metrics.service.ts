import "server-only";
import { unstable_cache, updateTag } from "next/cache";
import { connectDB } from "../db";
import {
  attributeSales,
  balePerformance,
  channelComparison,
  inventorySummary,
  pendingOrders,
  summarizeSales,
  topBuyers,
  topCommenters,
  weeklyRevenue,
  type BaleRow,
  type ClaimRow,
  type GarmentRow,
  type PaymentState,
  type SaleRow,
} from "@/lib/domain/metrics";
import baleModel from "../models/bale.model";
import customerModel from "../models/customer.model";
import garmentModel from "../models/garment.model";
import { ClaimModel } from "../models/live.model";
import saleModel from "../models/sale.model";

const TAG = "metrics";

/** Call from server actions after anything that changes sales, stock or claims. */
export function invalidateMetrics() {
  try {
    updateTag(TAG);
  } catch {
    // Not inside a server action (e.g. a route handler): the 60s revalidate covers it.
  }
}

async function compute() {
  await connectDB();
  const now = Date.now();

  // Projections only: the aggregation is done once here, not on every render.
  const [salesRaw, garmentsRaw, balesRaw, customersRaw, claimsRaw] = await Promise.all([
    saleModel
      .find({ deletedAt: null })
      .select("garmentId customerId baleId price paymentState createdAt")
      .lean<Record<string, unknown>[]>(),
    garmentModel
      .find({ deletedAt: null })
      .select("BaleId quantity isSold")
      .lean<Record<string, unknown>[]>(),
    baleModel
      .find({ deletedAt: null })
      .select("code name price sendPrice totalQuantity currentPieces createdAt")
      .lean<Record<string, unknown>[]>(),
    customerModel.find().select("name lastname").lean<Record<string, unknown>[]>(),
    ClaimModel.find().select("user status").limit(5000).lean<Record<string, unknown>[]>(),
  ]);

  const garments: GarmentRow[] = garmentsRaw.map((g) => ({
    id: String(g._id),
    baleId: g.BaleId ? String(g.BaleId) : undefined,
    quantity: Number(g.quantity ?? 1),
    isSold: Boolean(g.isSold),
  }));
  const sales: SaleRow[] = attributeSales(
    salesRaw.map((s) => ({
      id: String(s._id),
      garmentId: String(s.garmentId),
      customerId: String(s.customerId),
      baleId: s.baleId ? String(s.baleId) : undefined,
      price: Number(s.price ?? 0),
      paymentState: s.paymentState as PaymentState,
      createdAt: new Date(s.createdAt as Date).getTime(),
    })),
    garments,
  );
  const bales: BaleRow[] = balesRaw.map((b) => ({
    id: String(b._id),
    code: String(b.code),
    name: String(b.name),
    cost: Number(b.price ?? 0),
    sendCost: Number(b.sendPrice ?? 0),
    totalQuantity: Number(b.totalQuantity ?? 0),
    currentPieces: Number(b.currentPieces ?? 0),
    createdAt: new Date(b.createdAt as Date).getTime(),
  }));
  const names = new Map(customersRaw.map((c) => [String(c._id), `${c.name} ${c.lastname}`.trim()]));
  const claims = claimsRaw as unknown as ClaimRow[];

  return {
    generatedAt: now,
    sales: summarizeSales(sales),
    inventory: inventorySummary(garments, bales),
    bales: balePerformance(bales, sales, now),
    channels: channelComparison(sales),
    topBuyers: topBuyers(sales, names, 5),
    topCommenters: topCommenters(claims, 5),
    pending: pendingOrders(sales, 8).map((s) => ({
      id: s.id,
      customer: names.get(s.customerId) ?? "Cliente eliminado",
      price: s.price,
      createdAt: s.createdAt,
    })),
    week: weeklyRevenue(sales, now),
    pendingClaims: claims.filter((c) => c.status === "PENDING").length,
  };
}

export type DashboardMetrics = Awaited<ReturnType<typeof compute>>;

export const getDashboardMetrics = unstable_cache(compute, ["dashboard-metrics-v1"], {
  tags: [TAG],
  revalidate: 60,
});
