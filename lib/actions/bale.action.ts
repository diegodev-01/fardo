"use server";

import { connectDB } from "../db";
import baleModel from "../models/bale.model";
import { revalidatePath } from "next/cache";

export async function softDeleteBaleAction(id: string) {
  try {
    await connectDB();
    const updatedBale = await baleModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!updatedBale) {
      return { success: false, error: "Fardo no encontrado" };
    }

    revalidatePath("/admin/inventory");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBale)),
    };
  } catch (error) {
    console.error("Error en softDeleteBaleAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar fardo";
    return { success: false, error: message };
  }
}
