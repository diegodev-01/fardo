"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { guard, ownerFilter } from "@/lib/auth/guards";
import { rebalanceStock } from "@/lib/domain/inventory";
import { connectDB } from "../db";
import baleModel from "../models/bale.model";

const num = z.coerce.number().finite().min(0);

const updateBaleSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  price: num,
  weight: num.optional(),
  sendPrice: num.optional(),
  state: z.enum(["DISPONIBLE", "DEFECTUOSO", "RESERVADO", "VENDIDO"]).optional(),
  pieceTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        quantity: z.coerce.number().int().min(0),
        MinPiecePrice: num,
        MaxPiecePrice: num.optional(),
        category: z.string().min(1),
      }),
    )
    .min(1),
});

export type UpdateBaleInput = z.input<typeof updateBaleSchema>;

const ROLES = ["admin", "salesperson"] as const;

export async function softDeleteBaleAction(id: string) {
  try {
    const g = await guard([...ROLES]);
    if (!g.ok) return { success: false, error: g.error };

    await connectDB();
    const updatedBale = await baleModel.findOneAndUpdate(
      { _id: id, deletedAt: null, ...ownerFilter(g) },
      { deletedAt: new Date() },
      { new: true },
    );

    if (!updatedBale) {
      return { success: false, error: "Fardo no encontrado" };
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/salesperson/inventory");

    return { success: true, data: JSON.parse(JSON.stringify(updatedBale)) };
  } catch (error) {
    console.error("Error en softDeleteBaleAction:", error);
    return { success: false, error: "Error al eliminar fardo" };
  }
}

export async function getBaleByIdAction(id: string) {
  try {
    const g = await guard([...ROLES]);
    if (!g.ok) return { success: false, error: g.error };

    await connectDB();
    const bale = await baleModel.findOne({
      _id: id,
      deletedAt: null,
      ...ownerFilter(g),
    });

    if (!bale) {
      return { success: false, error: "Fardo no encontrado" };
    }

    return { success: true, data: JSON.parse(JSON.stringify(bale)) };
  } catch (error) {
    console.error("Error en getBaleByIdAction:", error);
    return { success: false, error: "Error al obtener fardo" };
  }
}

/**
 * Updates only whitelisted fields. Stock counters (currentPieces,
 * totalQuantity) are derived server-side and preserve existing sales.
 */
export async function updateBaleAction(id: string, updateData: UpdateBaleInput) {
  try {
    const g = await guard([...ROLES]);
    if (!g.ok) return { success: false, error: g.error };

    const parsed = updateBaleSchema.safeParse(updateData);
    if (!parsed.success) {
      return { success: false, error: "Datos del fardo inválidos" };
    }
    const { pieceTypes, ...rest } = parsed.data;

    await connectDB();
    const bale = await baleModel.findOne({
      _id: id,
      deletedAt: null,
      ...ownerFilter(g),
    });
    if (!bale) {
      return { success: false, error: "Fardo no encontrado" };
    }

    const stock = rebalanceStock(bale.pieceTypes ?? [], pieceTypes);
    if (!stock.ok) return { success: false, error: stock.error };

    bale.set({
      ...rest,
      pieceTypes: stock.pieceTypes,
      totalQuantity: stock.totalQuantity,
      currentPieces: stock.currentPieces,
    });
    await bale.save();

    revalidatePath("/admin/inventory");
    revalidatePath("/salesperson/inventory");

    return { success: true, data: JSON.parse(JSON.stringify(bale)) };
  } catch (error) {
    console.error("Error en updateBaleAction:", error);
    return { success: false, error: "Error al actualizar fardo" };
  }
}
