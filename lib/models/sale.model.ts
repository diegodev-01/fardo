import { model, models, Schema } from "mongoose";

export interface ISale {
  _id: string;
  garmentId: string;
  customerId: string;
  price: number;

  paymentState: "PENDIENTE" | "PAGADO" | "CANCELADO";
  comprobanteUrl?: string;

  deliveryId?: string;
  observations?: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    garmentId: { type: String, required: true },
    customerId: { type: String, required: true },
    price: { type: Number, required: true },

    paymentState: {
      type: String,
      enum: ["PENDIENTE", "PAGADO", "CANCELADO"],
      default: "PENDIENTE",
    },
    comprobanteUrl: { type: String },

    deliveryId: { type: String },
    observations: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export default models.Sale || model("Sale", SaleSchema);
