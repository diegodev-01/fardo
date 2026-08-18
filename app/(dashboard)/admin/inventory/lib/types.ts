import { IBale } from "@/lib/models/bale.model";

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
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
];

export const sizeOptions = [
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
