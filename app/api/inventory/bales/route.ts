import { connectDB } from "@/lib/db";
import baleModel from "@/lib/models/bale.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";

export const GET = withRole(
  ["admin", "salesperson", "customer"],
  async (req, session) => {
    await connectDB();

    const searchParams = new URL(req.url);
    const page = parseInt(searchParams.searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.searchParams.get("limit") || "10", 10);
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
  },
);

export const POST = withRole(["admin", "salesperson"], async (req, session) => {
  const { name, quantity, weight } = await req.json();

  if (!name || typeof quantity !== "number" || typeof weight !== "number") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await connectDB();
  const newBale = await baleModel.create({
    name,
    quantity,
    weight,
    salesperson: session.user.id,
  });

  return NextResponse.json(newBale, { status: 201 });
});
