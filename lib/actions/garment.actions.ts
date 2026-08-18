"use server";

import garmentModel from "../models/garment.model";

export async function getGarmentsAction() {
  try {
    const garments = await garmentModel.find({}).lean();
    return { success: true, data: garments };
  } catch (error) {
    console.error("Error en getGarmentsAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener clientes";
    return { success: false, error: message };
  }
}
