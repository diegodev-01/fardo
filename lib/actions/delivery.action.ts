"use server";

import { connectDB } from "../db";
import deliveryModel from "../models/delivery.model";
import { deliverySchema, DeliverySchemaType } from "../schemas/delivery";
import { revalidatePath } from "next/cache";

export async function getDeliveriesAction() {
  try {
    await connectDB();
    const deliveries = await deliveryModel.find({ deletedAt: null }).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(deliveries)),
    };
  } catch (error) {
    console.error("Error en getDeliveriesAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener entregas";
    return { success: false, error: message };
  }
}

export async function createDeliveryAction(data: DeliverySchemaType) {
  try {
    await connectDB();
    const validatedData = deliverySchema.parse(data);
    const newDelivery = await deliveryModel.create(validatedData);

    revalidatePath("/admin/deliveries");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newDelivery)),
    };
  } catch (error) {
    console.error("Error en createDeliveryAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear delivery";
    return { success: false, error: message };
  }
}

export async function softDeleteDeliveryAction(id: string) {
  try {
    await connectDB();
    const updatedDelivery = await deliveryModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!updatedDelivery) {
      return { success: false, error: "Delivery no encontrado" };
    }

    revalidatePath("/admin/deliveries");
    revalidatePath("/admin/settings");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedDelivery)),
    };
  } catch (error) {
    console.error("Error en softDeleteDeliveryAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar delivery";
    return { success: false, error: message };
  }
}
