"use server"
import deliveryModel from "../models/delivery.model";

export async function getDeliveriesAction() {
  try {
    const deliveries = await deliveryModel.find({}).lean();
    return { success: true, data: deliveries };
  } catch (error) {
    console.error("Error en getDeliveriesAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener clientes";
    return { success: false, error: message };
  }
}
