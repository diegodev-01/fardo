export type BaleState = "ABIERTO" | "A LA VENTA" | "VENDIDO";
export type GarmentState = "DISPONIBLE" | "DEFECTUOSO" | "RESERVADO" | "VENDIDO";

export interface IBale {
  _id?: string;
  name: string;
  weight: number;
  price: number;
  sendPrice: number;
  totalQuantity: number;
  state: BaleState;
  createdAt?: Date;
  updatedAt?: Date;
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