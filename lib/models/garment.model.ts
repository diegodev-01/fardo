import { model, models, Schema } from "mongoose";

export interface IGarment {
    _id: string;
    BaleId?: string;
    code?: string;
    name: string;
    price: number;
    quantity?: number;
    state: "DISPONIBLE" | "DEFECTUOSO" | "RESERVADO" | "VENDIDO";
    size?: string;
    garmentType?: string;
    grade?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

const GarmentSchema = new Schema<IGarment>(
    {
        BaleId: { type: String, required: false },
        code: { type: String, unique: true, sparse: true, required: false },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        state: {
            type: String,
            enum: ["DISPONIBLE", "DEFECTUOSO", "RESERVADO", "VENDIDO"],
            default: "DISPONIBLE",
        },
        size: { type: String, required: false },
        garmentType: { type: String, required: false },
        grade: { type: String, required: false },
        imageUrl: { type: String },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
    },
);

export default models.Garment || model("Garment", GarmentSchema);