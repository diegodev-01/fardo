export type BaleState = "A LA VENTA" | "VENDIDO";
export type GarmentState =
  | "DISPONIBLE"
  | "DEFECTUOSO"
  | "RESERVADO"
  | "VENDIDO";

export interface IBale {
  _id: string;
  code?: string;
  name: string;
  weight: number;
  price: number;
  sendPrice: number;
  totalQuantity: number;
  currentPieces: number;
  description: string;
  income: number;
  state: "DISPONIBLE" | "DEFECTUOSO" | "RESERVADO" | "VENDIDO";
  pieceTypes: {
    type: string;
    quantity: number;
    MinPiecePrice: number;
    MaxPiecePrice?: number;
    category: string;
  }[];
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt?: Date | null;
}

export interface IGarment {
  _id?: string;
  BaleId?: string;
  code?: string;
  name: string;
  price: number;
  quantity?: number;
  state: GarmentState;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
