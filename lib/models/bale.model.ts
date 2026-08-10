import { model, models, Schema } from "mongoose";

export interface IBale {
  _id: string;
  name: string;
  weight: number;
  price: number;
  sendPrice: number;
  totalQuantity: number;
  state: "ABIERTO" | "A LA VENTA" | "VENDIDO";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const BaleSchema = new Schema<IBale>(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    price: { type: Number, required: true },
    sendPrice: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    state: {
      type: String,
      enum: ["ABIERTO", "A LA VENTA", "VENDIDO"],
      default: "ABIERTO",
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export default models.Bale || model("Bale", BaleSchema);
