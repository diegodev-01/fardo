import { IBale } from "@/types/inventory";
import { model, models, Schema } from "mongoose";

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
      enum: ["DISPONIBLE", "DEFECTUOSO", "RESERVADO", "VENDIDO"],
      default: "DISPONIBLE",
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
        MinPiecePrice: {
          type: Number,
          required: true,
        },
        MaxPiecePrice: {
          type: Number,
          required: false,
        },
        category: {
          type: String,
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
