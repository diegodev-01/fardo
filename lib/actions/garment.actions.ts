"use server";

import { revalidatePath } from "next/cache";
import { guard, ownerFilter } from "@/lib/auth/guards";
import { connectDB } from "../db";
import garmentModel from "../models/garment.model";
import { assignMissingCodes } from "../services/counter.service";

const ROLES = ["admin", "salesperson"] as const;

export async function getGarmentsAction() {
  try {
    const g = await guard([...ROLES]);
    if (!g.ok) return { success: false, error: g.error };

    await connectDB();
    const garments = await garmentModel
      .find({ deletedAt: null, ...ownerFilter(g) })
      .lean();

    const serializedGarments = garments.map((garment) => ({
      ...garment,
      _id: garment._id.toString(),
      createdAt: garment.createdAt
        ? new Date(garment.createdAt).toISOString()
        : undefined,
      updatedAt: garment.updatedAt
        ? new Date(garment.updatedAt).toISOString()
        : undefined,
      deletedAt: garment.deletedAt
        ? new Date(garment.deletedAt).toISOString()
        : undefined,
    }));

    return { success: true, data: serializedGarments };
  } catch (error) {
    console.error("Error en getGarmentsAction:", error);
    return { success: false, error: "Error al obtener las prendas" };
  }
}

export async function softDeleteGarmentAction(id: string) {
  try {
    const g = await guard([...ROLES]);
    if (!g.ok) return { success: false, error: g.error };

    await connectDB();
    const updatedGarment = await garmentModel.findOneAndUpdate(
      { _id: id, deletedAt: null, ...ownerFilter(g) },
      { deletedAt: new Date() },
      { new: true },
    );

    if (!updatedGarment) {
      return { success: false, error: "Prenda no encontrada" };
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/salesperson/inventory");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedGarment)),
    };
  } catch (error) {
    console.error("Error en softDeleteGarmentAction:", error);
    return { success: false, error: "Error al eliminar prenda" };
  }
}

/** Backfills codes for garments created before codes existed. Admin only. */
export async function assignMissingCodesAction(baleId?: string) {
  try {
    const g = await guard(["admin"]);
    if (!g.ok) return { success: false as const, error: g.error };
    await connectDB();
    const count = await assignMissingCodes(baleId);
    revalidatePath("/print/labels");
    revalidatePath("/admin/inventory");
    return { success: true as const, count };
  } catch (error) {
    console.error("Error en assignMissingCodesAction:", error);
    return { success: false as const, error: "Error al generar códigos" };
  }
}
