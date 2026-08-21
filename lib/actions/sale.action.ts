"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { connectDB } from "../db";
import baleModel from "../models/bale.model";
import garmentModel from "../models/garment.model";
import saleModel from "../models/sale.model";
import { saleSchema, SaleSchemaType } from "../schemas/sale";

export async function createSaleAction(data: SaleSchemaType) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = saleSchema.parse(data);
    console.log("validateData: ", validatedData);

    if (validatedData.baleId) {
      const quantityToDeduct = 1;

      const bale = await baleModel
        .findById(validatedData.baleId)
        .session(session);

      if (!bale) {
        throw new Error("El fardo/bale especificado no existe.");
      }

      if (bale.currentPieces < quantityToDeduct) {
        throw new Error(
          `Stock insuficiente en el fardo. Disponibles: ${bale.currentPieces}, solicitados: ${quantityToDeduct}`,
        );
      }

      await baleModel.findByIdAndUpdate(
        validatedData.baleId,
        { $inc: { currentPieces: -quantityToDeduct } },
        { session, new: true },
      );
    } else if (validatedData.garmentId) {
      const garment = await garmentModel
        .findById(validatedData.garmentId)
        .session(session);

      console.log("la ropita: ", garment);

      if (!garment) {
        throw new Error("La prenda especificada no existe.");
      }

      if (garment.status === "VENDIDO" || garment.isSold) {
        throw new Error("Esta prenda ya fue vendida previamente.");
      }

      await garmentModel.findByIdAndUpdate(
        validatedData.garmentId,
        {
          $set: {
            state: "VENDIDO",
            status: "VENDIDO",
            isSold: true,
          },
        },
        { session },
      );

      const baleId = garment.BaleId || garment.baleId;

      if (baleId) {
        const bale = await baleModel.findById(baleId).session(session);

        if (bale) {
          const updatePayload: Record<string, number> = {
            currentPieces: -1,
          };

          if (Array.isArray(bale.pieceTypes)) {
            const targetType = garment.garmentType?.toString();

            const pieceTypeIndex = bale.pieceTypes.findIndex(
              (pt: { type?: any; garmentType?: string; _id?: string }) => {
                const ptType = (
                  pt.type ||
                  pt.garmentType ||
                  pt._id
                )?.toString();
                return ptType === targetType;
              },
            );

            if (pieceTypeIndex !== -1) {
              const currentQty =
                bale.pieceTypes[pieceTypeIndex].currentQuantity ?? 0;
              if (currentQty < 1) {
                throw new Error(
                  `Stock insuficiente para el tipo de prenda especificado en el fardo.`,
                );
              }

              updatePayload[`pieceTypes.${pieceTypeIndex}.currentQuantity`] =
                -1;
            } else {
              console.warn(
                `Advertencia: No se encontró el tipo de prenda '${targetType}' dentro de pieceTypes del fardo.`,
              );
            }
          }

          await baleModel.findByIdAndUpdate(
            baleId,
            { $inc: updatePayload },
            { session, new: true },
          );
        }
      }
    }

    const [newSale] = await saleModel.create([validatedData], { session });

    await session.commitTransaction();
    session.endSession();

    revalidatePath("/admin/orders");
    revalidatePath("/admin/garments");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newSale)),
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error en createSaleAction:", error);

    if (error instanceof ZodError) {
      const issue = error.issues[0];
      return {
        success: false,
        error: `Error de validación: ${issue.path.join(".")} - ${issue.message}`,
      };
    }

    const message =
      error instanceof Error ? error.message : "Error al crear la venta";

    return { success: false, error: message };
  }
}
