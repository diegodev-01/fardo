"use server";

import { connectDB } from "../db";
import saleModel from "../models/sale.model";
import { saleSchema, SaleSchemaType } from "../schemas/sale";
import { revalidatePath } from "next/cache";

export async function createSaleAction(data: SaleSchemaType) {
  try {
    await connectDB();
    const validatedData = saleSchema.parse(data);
    const newSale = await saleModel.create(validatedData);

    revalidatePath("/admin/orders");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newSale)),
    };
  } catch (error) {
    console.error("Error en createSaleAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear la venta";
    return { success: false, error: message };
  }
}
