import { connectDB } from "@/lib/db";
import PieceTypeModel from "@/lib/models/piece-type.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";
import { z } from "zod";

const createPieceTypeSchema = z.object({
  label: z.string().min(1, "El nombre/label es requerido"),
  value: z
    .string()
    .min(1, "El código/value es requerido")
    .transform((val) => val.trim().toUpperCase().replace(/\s+/g, "_")),
});

export const GET = withRole(["admin", "salesperson", "customer"], async () => {
  try {
    await connectDB();

    const pieceTypes = await PieceTypeModel.find({})
      .sort({ label: 1 })
      .select("label value _id")
      .lean();

    return NextResponse.json(pieceTypes);
  } catch (error) {
    console.error("Error en GET /api/piece-types:", error);
    return NextResponse.json(
      { error: "Error al obtener los tipos de prendas" },
      { status: 500 },
    );
  }
});

export const POST = withRole(["admin"], async (req) => {
  try {
    const body = await req.json();

    const validation = createPieceTypeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", issues: validation.error.format() },
        { status: 400 },
      );
    }

    const { label, value } = validation.data;

    await connectDB();

    const existingType = await PieceTypeModel.findOne({ value }).lean();
    if (existingType) {
      return NextResponse.json(
        { error: "Ya existe un tipo de prenda con ese valor/código" },
        { status: 409 },
      );
    }

    const newPieceType = await PieceTypeModel.create({
      label,
      value,
    });

    return NextResponse.json(newPieceType, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/piece-types:", error);
    return NextResponse.json(
      { error: "Error al crear el tipo de prenda" },
      { status: 500 },
    );
  }
});
