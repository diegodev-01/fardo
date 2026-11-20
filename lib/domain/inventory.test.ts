import { describe, expect, it } from "vitest";
import { rebalanceStock } from "./inventory";

const t = (type: string, quantity: number) => ({ type, quantity, MinPiecePrice: 1, category: "x" });

describe("rebalanceStock", () => {
  it("preserves sold counts when quantity grows", () => {
    const r = rebalanceStock([{ type: "A", quantity: 10, currentPieces: 7 }], [t("A", 12)]);
    expect(r).toMatchObject({ ok: true, totalQuantity: 12, currentPieces: 9 });
  });
  it("rejects shrinking below sold", () => {
    expect(rebalanceStock([{ type: "A", quantity: 10, currentPieces: 4 }], [t("A", 5)]).ok).toBe(false);
  });
  it("rejects removing a type with sales, allows removing untouched", () => {
    expect(rebalanceStock([{ type: "A", quantity: 3, currentPieces: 2 }], [t("B", 3)]).ok).toBe(false);
    expect(rebalanceStock([{ type: "A", quantity: 3, currentPieces: 3 }], [t("B", 3)]).ok).toBe(true);
  });
  it("rejects duplicate types", () => {
    expect(rebalanceStock([], [t("A", 1), t("A", 2)]).ok).toBe(false);
  });
});
