import { connectDB } from "@/lib/db";
import baleModel from "@/lib/models/bale.model";
import { withRole } from "@/lib/with-role";
import { formSchema } from "@/lib/schemas/bale";
import { NextResponse } from "next/server";
import { nextBaleCodeAtomic } from "@/lib/services/counter.service";
import { parsePagination } from "@/lib/utils/pagination";

export const GET = withRole(
  ["admin", "salesperson"],
  async (req, session) => {
    try {
      await connectDB();

      const { searchParams } = new URL(req.url);
      const { page, limit, skip } = parsePagination(searchParams);

      const baseQuery =
        session.user.role === "admin" ? {} : { salesperson: session.user.id };

      const query = {
        ...baseQuery,
        deletedAt: null,
      };

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

    // Codes come from an atomic counter; the retry only covers manual/legacy collisions.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const newBale = await baleModel.create({
          ...validation.data,
          code: await nextBaleCodeAtomic(),
          salesperson: session.user.id,
          currentPieces: validation.data.totalQuantity,
        });
        return NextResponse.json(newBale, { status: 201 });
      } catch (e) {
        if ((e as { code?: number }).code !== 11000) throw e;
      }
    }
    return NextResponse.json(
      { error: "No se pudo generar un código único, intenta de nuevo" },
      { status: 409 },
    );
  } catch (error) {
    console.error("Error en POST /api/bales:", error);
    return NextResponse.json(
      { error: "Error interno al guardar el fardo" },
      { status: 500 },
    );
  }
});
