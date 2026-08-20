"use server";

import { connectDB } from "@/lib/db";
import userModel from "@/lib/models/user.model";

export interface SalespersonSummary {
  _id: string;
  name: string;
  phone?: string;
  role: string;
}

export interface AdminSummary {
  _id: string;
  name: string;
  phone?: string;
  role: string;
}

export async function getSalespersonsAction() {
  try {
    await connectDB();
    const salespersons = await userModel
      .find({ role: "salesperson" })
      .select("_id name phone role")
      .lean();

    const serialized: SalespersonSummary[] = salespersons.map((user) => ({
      _id: String(user._id),
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

export async function getAdminsAction() {
  try {
    await connectDB();
    const admins = await userModel
      .find({ role: "admin" })
      .select("_id name phone role")
      .lean();

    const serialized: AdminSummary[] = admins.map((user) => ({
      _id: String(user._id),
      name: user.name,
      phone: user.phone,
      role: user.role,
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error en getAdminsAction:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener administradoresf";
    return { success: false, error: message };
  }
}
