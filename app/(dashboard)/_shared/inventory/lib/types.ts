import { IBale } from "@/types/inventory";
export interface Piece {
  _id: number;
  name: string;
  state: string;
  color: string;
  size: string;
  price: string;
  grade?: string;
  garmentType?: string;
}

export interface Card extends IBale {
  type: "garment" | "bale";
  pieces?: Piece[];
  availableQuantity?: number;
  color?: string;
}

export const gradeOptions = [
  { label: "Premium", value: "PREMIUM" },
  { label: "SemiNuevo", value: "SEMINUEVO" },
  { label: "Estandar", value: "Estandar" },
  { label: "Con detalles", value: "CON_DETALLES" },
  { label: "Gratis", value: "Gratis" },
];

export const sizeOptions = [
  { label: "Niños", value: "NINOS" },
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "SM", value: "SM" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
];

export const calculatePercentage = (current = 0, total = 0) => {
  if (!total || total === 0) return "0.0";
  return ((current / total) * 100).toFixed(1);
};
