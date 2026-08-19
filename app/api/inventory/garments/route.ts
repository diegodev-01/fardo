import { connectDB } from "@/lib/db";
import garmentModel from "@/lib/models/garment.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";

export const GET = withRole(
  ["admin", "salesperson", "customer"],
  async (req, session) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query =
      session.user.role === "admin" ? {} : { salesperson: session.user.id };

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

export const POST = withRole(["admin", "salesperson"], async (req, session) => {
  const {
    name,
    quantity,
    price,
    baleId,
    size,
    garmentType,
    grade,
    description,
    state,
    color,
    salesPersonId,
  } = await req.json();

  if (!name || typeof quantity !== "number") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await connectDB();

  const garmentData: any = {
    name,
    quantity,
    price,
    size,
    garmentType,
    grade,
    description,
    state,
    color,
    salesperson: salesPersonId || session.user.id,
  };

  if (baleId) {
    garmentData.BaleId = baleId;
    garmentData.type = "from_bale";

    const baleModel = (await import("@/lib/models/bale.model")).default;
    await baleModel.findByIdAndUpdate(baleId, {
      $inc: { currentPieces: -quantity },
    });
  }
  const newGarment = await garmentModel.create(garmentData);

  return NextResponse.json(newGarment, { status: 201 });
});
