import { connectDB } from "@/lib/db";
import garmentModel from "@/lib/models/garment.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { parsePagination } from "@/lib/utils/pagination";
import baleModel from "@/lib/models/bale.model";
import { nextItemCode, nextLooseCode } from "@/lib/services/counter.service";

export const GET = withRole(
  ["admin", "salesperson"],
  async (req, session) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const query = {
      deletedAt: null,
      ...(session.user.role === "admin"
        ? {}
        : { salesperson: new Types.ObjectId(session.user.id) }),
    };

    const [garments, totalDocs, totals] = await Promise.all([
      garmentModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      garmentModel.countDocuments(query),
      garmentModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
            totalCost: { $sum: { $multiply: ["$quantity", "$price"] } },
            availableQuantity: {
              $sum: {
                $cond: {
                  if: { $eq: ["$state", "DISPONIBLE"] },
                  then: "$quantity",
                  else: 0,
                },
              },
            },
          },
        },
      ]),
    ]);

    const metrics = totals[0] ?? {
      totalQuantity: 0,
      totalCost: 0,
      availableQuantity: 0,
    };
    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json({
      data: garments,
      info: {
        totalDocs,
        totalQuantity: metrics.totalQuantity,
        totalCost: metrics.totalCost,
        availableQuantity: metrics.availableQuantity,
      },
      pagination: {
        page,
        limit,
        total: totalDocs,
        totalPages,
        hasNextPage: page * limit < totalDocs,
        hasPrevPage: page > 1,
      },
    });
  },
);

const garmentCreateSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  price: z.number().finite().min(0),
  baleId: z.string().optional(),
  size: z.string().optional(),
  garmentType: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  state: z.enum(["DISPONIBLE", "DEFECTUOSO", "RESERVADO", "VENDIDO"]).optional(),
  color: z.string().optional(),
  salesPersonId: z.string().optional(),
});

export const POST = withRole(["admin", "salesperson"], async (req, session) => {
  const parsed = garmentCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { baleId, salesPersonId, ...fields } = parsed.data;

  await connectDB();

  // Only admins may assign a garment to another salesperson.
  const owner =
    session.user.role === "admin" && salesPersonId
      ? salesPersonId
      : session.user.id;

  const garmentData: Record<string, unknown> = { ...fields, salesperson: owner };

  if (baleId) {
    if (!Types.ObjectId.isValid(baleId)) {
      return NextResponse.json({ error: "Fardo inválido" }, { status: 400 });
    }
    const bale = await baleModel.findOneAndUpdate(
      { _id: baleId, deletedAt: null },
      { $inc: { singlePieces: fields.quantity } },
    );
    if (!bale) {
      return NextResponse.json({ error: "Fardo no encontrado" }, { status: 404 });
    }
    garmentData.BaleId = baleId;
    garmentData.code = await nextItemCode(bale.code);
  } else {
    garmentData.code = await nextLooseCode();
  }

  const newGarment = await garmentModel.create(garmentData);
  return NextResponse.json(newGarment, { status: 201 });
});
