"use server";

import { connectDB } from "@/lib/db";
import userModel from "@/lib/models/user.model";

export async function getSalespersonsAction() {
  try {
    await connectDB();
    const salespersons = await userModel.find({ role: "salesperson" }).lean();
    
    // Serialization for Client Components
    const serialized = salespersons.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      role: user.role,
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error en getSalespersonsAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener vendedores";
    return { success: false, error: message };
  }
}
