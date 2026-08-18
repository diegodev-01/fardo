"use server";

import garmentModel from "../models/garment.model";

export async function getGarmentsAction() {
  try {
    const garments = await garmentModel.find({}).lean();

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
    const message =
      error instanceof Error ? error.message : "Error al obtener las prendas";
    return { success: false, error: message };
  }
}

export async function softDeleteGarmentAction(id: string) {
  try {
    const { connectDB } = await import("../db");
    await connectDB();
    const updatedGarment = await garmentModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!updatedGarment) {
      return { success: false, error: "Prenda no encontrada" };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/inventory");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedGarment)),
    };
  } catch (error) {
    console.error("Error en softDeleteGarmentAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar prenda";
    return { success: false, error: message };
  }
}
