import { model, models, Schema } from "mongoose";

export interface IBale {
  _id: string;
  name: string;
  weight: number;
  price: number;
  sendPrice: number;
  totalQuantity: number;
  currentPieces: number;
  description: string;
  income: number;
  state: "ABIERTO" | "DISPONIBLE" | "VENDIDO";
  pieceTypes: { type: string; quantity: number }[];
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt?: Date | null;
}

const BaleSchema = new Schema<IBale>(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    price: { type: Number, required: true },
    sendPrice: { type: Number, required: false },
    totalQuantity: { type: Number, required: true },
    description: { type: String, required: false },
    income: { type: Number, default: 0 },
    currentPieces: {
      type: Number,
      required: true,
      min: [0, "El stock de piezas no puede ser negativo"],
    },
    state: {
      type: String,
      enum: ["ABIERTO", "DISPONIBLE", "VENDIDO"],
      default: "ABIERTO",
    },
    pieceTypes: [
      {
        type: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export default models.Bale || model("Bale", BaleSchema);
