import { model, models, Schema } from "mongoose";

export type DeliveryMethodType = "flash" | "punto fijo" | "envio";

export interface LocationDetails {
  name: string;
  address: string;
  notes?: string;
}

export interface IDelivery {
  _id: string;
  name: string;
  phone: string;
  //   type: "ENVIO" | "ENTREGA";
  deliveryMethod: DeliveryMethodType;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    deliveryMethod: {
      type: String,
      enum: ["flash", "punto fijo", "envio"],
      required: true,
    },
    address: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export default models.Delivery || model("Delivery", DeliverySchema);