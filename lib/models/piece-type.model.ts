import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPieceType extends Document {
  label: string;
  value: string;
}

const PieceTypeSchema = new Schema<IPieceType>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const PieceTypeModel: Model<IPieceType> =
  mongoose.models.PieceType ||
  mongoose.model<IPieceType>("PieceType", PieceTypeSchema);

export default PieceTypeModel;