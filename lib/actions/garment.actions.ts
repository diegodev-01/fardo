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
