import { connectDB } from "@/lib/db";
import garmentModel from "@/lib/models/garment.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

const garmentUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  quantity: z.number().int().min(1).optional(),
  price: z.number().finite().min(0).optional(),
  size: z.string().optional(),
  garmentType: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  state: z.enum(["DISPONIBLE", "DEFECTUOSO", "RESERVADO"]).optional(),
  color: z.string().optional(),
});

export const PUT = withRole<{ id: string }>(
  ["admin", "salesperson"],
  async (req, session, { params }) => {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const parsed = garmentUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await connectDB();
    const filter: Record<string, unknown> = {
      _id: id,
      deletedAt: null,
      isSold: false,
    };
    if (session.user.role !== "admin") {
      filter.salesperson = new Types.ObjectId(session.user.id);
    }
    const garment = await garmentModel.findOneAndUpdate(filter, parsed.data, {
      new: true,
    });
    if (!garment) {
      return NextResponse.json(
        { error: "Prenda no encontrada o ya vendida" },
        { status: 404 },
      );
    }
    return NextResponse.json(garment);
  },
);
