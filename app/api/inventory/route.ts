import { connectDB } from "@/lib/db";
import baleModel from "@/lib/models/bale.model";
import garmentModel from "@/lib/models/garment.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";

export const GET = withRole(["admin", "salesperson"], async (req, session) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
  const skip = (page - 1) * limit;

  const query =
    session.user.role === "admin" ? {} : { salesperson: session.user.id };

  const [bales, garments, totalBales, totalGarments] = await Promise.all([
    baleModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    garmentModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    baleModel.countDocuments(query),
    garmentModel.countDocuments(query),
  ]);

  const maxTotalDocs = Math.max(totalBales, totalGarments);
  const totalPages = Math.ceil(maxTotalDocs / limit);

  const inventory = {
    data: {
      bales: bales.map(({ _id, name, quantity, createdAt }) => ({
        id: _id,
        name,
        quantity,
        createdAt,
      })),
      garments: garments.map(({ _id, name, quantity, createdAt }) => ({
        id: _id,
        name,
        quantity,
        createdAt,
      })),
    },
    pagination: {
      page,
      limit,
      totalBales,
      totalGarments,
      totalPages,
      hasNextPage: page * limit < maxTotalDocs,
      hasPrevPage: page > 1,
    },
  };

  return NextResponse.json(inventory);
});
