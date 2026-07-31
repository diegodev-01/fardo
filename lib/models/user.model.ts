import { model, models, Schema } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  role: "admin" | "customer" | "salesperson";
  email?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "customer", "salesperson"],
      required: true,
    },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export default models.User || model("User", UserSchema);
