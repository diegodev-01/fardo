import { connectDB } from "@/lib/db";
import baleModel from "@/lib/models/bale.model";
import garmentModel from "@/lib/models/garment.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";

export const GET = withRole(["admin", "salesperson"], async (req, session) => {
  await connectDB();
  const query =
    session.user.role === "admin" ? {} : { salesperson: session.user.id };

  const [bales, garments] = await Promise.all([
    baleModel.find(query).sort({ createdAt: -1 }),
    garmentModel.find(query).sort({ createdAt: -1 }),
  ]);

  const inventory = {
    bales: bales.map((bale) => ({
      id: bale._id,
      name: bale.name,
      quantity: bale.quantity,
      createdAt: bale.createdAt,
    })),
    garments: garments.map((garment) => ({
      id: garment._id,
      name: garment.name,
      quantity: garment.quantity,
      createdAt: garment.createdAt,
    })),
  };

  return NextResponse.json(inventory);
});
