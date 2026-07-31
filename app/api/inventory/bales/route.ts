import { connectDB } from "@/lib/db";
import baleModel from "@/lib/models/bale.model";
import { withRole } from "@/lib/with-role";
import { NextResponse } from "next/server";

export const GET = withRole(["admin", "salesperson"], async (req, session) => {
  await connectDB();

  const query =
    session.user.role === "admin" ? {} : { salesperson: session.user.id };

  const bales = await baleModel.find(query).sort({ createdAt: -1 });

  return NextResponse.json(bales);
});

export const POST = withRole(["admin", "salesperson"], async (req, session) => {
  const { name, quantity } = await req.json();

  if (!name || typeof quantity !== "number") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await connectDB();
  const newBale = await baleModel.create({
    name,
    quantity,
    salesperson: session.user.id,
  });

  return NextResponse.json(newBale, { status: 201 });
});
