"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "../db";
import baleModel from "../models/bale.model";
import { IBale } from "@/types/inventory";

export async function softDeleteBaleAction(id: string) {
  try {
    await connectDB();
    const updatedBale = await baleModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true },
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

export async function getBaleByIdAction(id: string) {
  try {
    await connectDB();
    const bale = await baleModel.findById(id);

    if (!bale) {
      return { success: false, error: "Fardo no encontrado" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(bale)),
    };
  } catch (error) {
    console.error("Error en getBaleByIdAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener fardo";
    return { success: false, error: message };
  }
}

export async function updateBaleAction(
  id: string,
  updateData: Partial<
    Omit<IBale, "_id" | "createdAt" | "updatedAt" | "deletedAt">
  >,
) {
  try {
    await connectDB();
     console.log("BODY RECIBIDO:", updateData);
    const updatedBale = await baleModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBale) {
      return { success: false, error: "Fardo no encontrado" };
    }

    revalidatePath("/admin/inventory");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBale)),
    };
  } catch (error) {
    console.error("Error en updateBaleAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al actualizar fardo";
    return { success: false, error: message };
  }
}
