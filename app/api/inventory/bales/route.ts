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

    const validation = formSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos del formulario inválidos",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    await connectDB();

    const newBale = await baleModel.create({
      ...validation.data,
      salesperson: session.user.id,
    });

    return NextResponse.json(newBale, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/bales:", error);
    return NextResponse.json(
      { error: "Error interno al guardar el fardo" },
      { status: 500 },
    );
  }
});
