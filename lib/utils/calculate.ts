import { Card } from "@/app/(dashboard)/admin/inventory/[[...slug]]/page";

export const calculateClassificationProgress = (card: Card | null) => {
  if (!card || !card.totalQuantity || card.totalQuantity === 0) return 0;

  const current = card.currentPieces || 0;
  const percentage = (current / card.totalQuantity) * 100;

  // Limita el rango entre 0 y 100, y lo formatea a 1 decimal
  return Math.min(Math.max(percentage, 0), 100).toFixed(1);
};
