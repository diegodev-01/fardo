import { model, models, Schema } from "mongoose";

export interface ICustomer {
  _id?: string;
  name: string;
  lastname: string;
  phone: string;
  address: IAddress;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

interface IAddress {
  _id?: string;
  department: string;
  city: string;
  address: string;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      department: { type: String, required: false },
      address: { type: String, required: false },
      city: { type: String, required: false },
    },
    email: { type: String, required: false, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

export default models.Customer || model("Customer", CustomerSchema);
