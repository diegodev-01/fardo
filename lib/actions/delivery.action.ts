"use server"
import deliveryModel from "../models/delivery.model";
import { deliverySchema, DeliverySchemaType } from "../schemas/delivery";
import { revalidatePath } from "next/cache";

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

export async function createDeliveryAction(data: DeliverySchemaType) {
  try {
    const validatedData = deliverySchema.parse(data);
    const newDelivery = await deliveryModel.create(validatedData);
    revalidatePath("/admin/deliveries");
    return { success: true, data: JSON.parse(JSON.stringify(newDelivery)) };
  } catch (error) {
    console.error("Error en createDeliveryAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear delivery";
    return { success: false, error: message };
  }
}
