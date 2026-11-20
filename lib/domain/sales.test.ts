import { describe, expect, it } from "vitest";
import { paymentTransition, planGarmentSaleStock } from "./sales";

describe("planGarmentSaleStock", () => {
  const bale = { pieceTypes: [{ type: "Polera" }, { type: "Jean" }] };
  it("finds the type and quantity", () => {
    expect(planGarmentSaleStock({ garmentType: "Jean", quantity: 2 }, bale)).toEqual({ ok: true, qty: 2, pieceTypeIndex: 1 });
  });
  it("fails instead of drifting counters", () => {
    expect(planGarmentSaleStock({}, bale).ok).toBe(false);
    expect(planGarmentSaleStock({ garmentType: "Abrigo" }, bale).ok).toBe(false);
  });
});
describe("paymentTransition", () => {
  it("tracks income", () => {
    expect(paymentTransition("PENDIENTE", "PAGADO", 50)).toEqual({ incomeDelta: 50, restoreStock: false });
    expect(paymentTransition("PAGADO", "CANCELADO", 50)).toEqual({ incomeDelta: -50, restoreStock: true });
    expect(paymentTransition("PENDIENTE", "CANCELADO", 50)).toEqual({ incomeDelta: 0, restoreStock: true });
    expect(paymentTransition("CANCELADO", "PAGADO", 50)).toBeNull();
    expect(paymentTransition("PAGADO", "PAGADO", 50)).toBeNull();
  });
});
