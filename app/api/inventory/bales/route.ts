import { connectDB } from "@/lib/db";
import baleModel from "@/lib/models/bale.model";
import { withRole } from "@/lib/with-role";
import { formSchema } from "@/lib/schemas/bale";
import { NextResponse } from "next/server";

export const GET = withRole(
  ["admin", "salesperson", "customer"],
  async (req, session) => {
    try {
      await connectDB();

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;

      const query =
        session.user.role === "admin" ? {} : { salesperson: session.user.id };

      const [bales, totalDocs] = await Promise.all([
        baleModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        baleModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalDocs / limit);

      return NextResponse.json({
        data: bales,
        pagination: {
          page,
          limit,
          total: totalDocs,
          totalPages,
          hasNextPage: page * limit < totalDocs,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error("Error en GET /api/bales:", error);
      return NextResponse.json(
        { error: "Error interno al obtener los fardos" },
        { status: 500 },
      );
    }
  },
);

export const POST = withRole(["admin", "salesperson"], async (req, session) => {
  try {
    const body = await req.json();

    console.log("BODY RECIBIDO:", JSON.stringify(body.pieceTypes, null, 2));

    const validation = formSchema.safeParse(body);

    if (!validation.success) {
      console.log(
        "VALIDATION ERROR:",
        JSON.stringify(validation.error.format(), null, 2),
      );
      return NextResponse.json(
        {
          error: "Datos del formulario inválidos",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    console.log(
      "PIECE TYPES VALIDADOS:",
      JSON.stringify(validation.data.pieceTypes, null, 2),
    );

    await connectDB();

    const newBale = await baleModel.create({
      ...validation.data,
      salesperson: session.user.id,
      currentPieces: validation.data.totalQuantity,
    });
    console.log(
      "BALE CREADO (raw):",
      JSON.stringify(newBale.pieceTypes, null, 2),
    );

    return NextResponse.json(newBale, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/bales:", error);
    return NextResponse.json(
      { error: "Error interno al guardar el fardo" },
      { status: 500 },
    );
  }
});
