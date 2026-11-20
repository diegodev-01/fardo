export interface StockPlan {
  ok: true;
  qty: number;
  /** index in bale.pieceTypes to decrement */
  pieceTypeIndex: number;
}

export function planGarmentSaleStock(
  garment: { quantity?: number; garmentType?: string },
  bale: { pieceTypes: { type: string }[] },
): StockPlan | { ok: false; error: string } {
  const qty = Math.max(1, Math.floor(garment.quantity ?? 1));
  if (!garment.garmentType) {
    return { ok: false, error: "La prenda no tiene tipo; no se puede descontar del fardo" };
  }
  const pieceTypeIndex = bale.pieceTypes.findIndex((p) => p.type === garment.garmentType);
  if (pieceTypeIndex === -1) {
    return { ok: false, error: `El tipo "${garment.garmentType}" no existe en el fardo` };
  }
  return { ok: true, qty, pieceTypeIndex };
}

export type PaymentState = "PENDIENTE" | "PAGADO" | "CANCELADO";

export interface PaymentEffect {
  /** amount to add to bale.income (negative to revert) */
  incomeDelta: number;
  restoreStock: boolean;
}

/** Allowed payment-state transitions and their side effects. */
export function paymentTransition(
  from: PaymentState,
  to: PaymentState,
  price: number,
): PaymentEffect | null {
  if (from === to) return null;
  if (from === "CANCELADO") return null;
  if (from === "PENDIENTE" && to === "PAGADO") return { incomeDelta: price, restoreStock: false };
  if (from === "PAGADO" && to === "PENDIENTE") return { incomeDelta: -price, restoreStock: false };
  if (to === "CANCELADO") return { incomeDelta: from === "PAGADO" ? -price : 0, restoreStock: true };
  return null;
}
