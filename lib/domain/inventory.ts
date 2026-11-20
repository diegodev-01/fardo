export interface PieceTypeInput {
  type: string;
  quantity: number;
  MinPiecePrice: number;
  MaxPiecePrice?: number;
  category: string;
}
export interface PieceTypeStock extends PieceTypeInput {
  currentPieces: number;
}

export type RebalanceResult =
  | { ok: true; pieceTypes: PieceTypeStock[]; totalQuantity: number; currentPieces: number }
  | { ok: false; error: string };

/**
 * Applies an edit of a bale's piece types while preserving what was already
 * sold: sold = oldQuantity - oldCurrentPieces per type. Never resets stock.
 */
export function rebalanceStock(
  previous: { type: string; quantity: number; currentPieces?: number }[],
  next: PieceTypeInput[],
): RebalanceResult {
  const soldByType = new Map<string, number>();
  for (const p of previous) {
    const sold = p.quantity - (p.currentPieces ?? p.quantity);
    if (sold > 0) soldByType.set(p.type, (soldByType.get(p.type) ?? 0) + sold);
  }

  const seen = new Set<string>();
  const pieceTypes: PieceTypeStock[] = [];
  for (const n of next) {
    if (seen.has(n.type)) return { ok: false, error: `Tipo de prenda duplicado: ${n.type}` };
    seen.add(n.type);
    const sold = soldByType.get(n.type) ?? 0;
    if (n.quantity < sold) {
      return { ok: false, error: `"${n.type}": la cantidad no puede ser menor a las piezas ya vendidas (${sold})` };
    }
    pieceTypes.push({ ...n, currentPieces: n.quantity - sold });
  }
  for (const [type, sold] of soldByType) {
    if (!seen.has(type)) return { ok: false, error: `No se puede quitar "${type}": tiene ${sold} pieza(s) vendida(s)` };
  }

  return {
    ok: true,
    pieceTypes,
    totalQuantity: pieceTypes.reduce((s, p) => s + p.quantity, 0),
    currentPieces: pieceTypes.reduce((s, p) => s + p.currentPieces, 0),
  };
}
