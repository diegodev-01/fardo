import { escapeRegex, parsePagination } from "@/lib/utils/pagination";
import { connectDB } from "@/lib/db";
import { withRole } from "@/lib/with-role";
import { NextRequest, NextResponse } from "next/server";
import customerModel from "@/lib/models/customer.model";

export const GET = withRole(["admin", "salesperson" ], async (req: NextRequest, session) => {
  try {
    await connectDB();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(searchParams);
    const query = (searchParams.get("query") || "").slice(0, 100);

    const filter = query
      ? { name: { $regex: escapeRegex(query), $options: "i" } }
      : {};

    const [customers, totalDocs] = await Promise.all([
      customerModel.find(filter).skip(skip).limit(limit).lean(),
      customerModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json({
      customers,
      pagination: {
        totalDocs,
        totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Error interno al obtener los clientes" },
      { status: 500 },
    );
  }
});

export const POST = withRole(["admin", "salesperson"], async (req: NextRequest, session) => {
  try {
    await connectDB();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.name || !data.lastname || !data.phone || !data.address) {
      return NextResponse.json(
        { message: "Datos incompletos para crear el cliente" },
        { status: 400 },
      );
    }

    if (data.email) {
      const existingCustomer = await customerModel.findOne({
        email: data.email,
      });
      if (existingCustomer) {
        return NextResponse.json(
          { message: "Ya existe un cliente con este correo electrónico" },
          { status: 400 },
        );
      }
    }

    if (data.phone) {
      const existingCustomer = await customerModel.findOne({
        phone: data.phone,
      });
      if (existingCustomer) {
        return NextResponse.json(
          { message: "Ya existe un cliente con este número de teléfono" },
          { status: 400 },
        );
      }
    }

    const newCustomer = new customerModel(data);
    await newCustomer.save();

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { message: "Error interno al crear el cliente" },
      { status: 500 },
    );
  }
});
