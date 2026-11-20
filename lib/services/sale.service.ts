import mongoose from "mongoose";
import { paymentTransition, planGarmentSaleStock, type PaymentState } from "@/lib/domain/sales";
import { connectDB } from "../db";
import baleModel from "../models/bale.model";
import garmentModel from "../models/garment.model";
import saleModel from "../models/sale.model";
import { saleSchema, SaleSchemaType } from "../schemas/sale";

export async function inTransaction<T>(fn: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => fn(session)) as T;
  } finally {
    await session.endSession();
  }
}

/**
 * Sells a garment (no auth; callers must guard). All stock changes are conditional atomic updates inside a
 * transaction (requires a replica set), so concurrent sales cannot oversell.
 */
export async function createSaleCore(data: SaleSchemaType) {
    const input = saleSchema.parse(data);
    if (input.paymentState === "CANCELADO") {
      throw new Error("No se puede crear una venta cancelada");
    }
    if (!(input.price > 0)) throw new Error("El precio debe ser mayor a 0");

    await connectDB();

    const newSale = await inTransaction(async (session) => {
      // Claim the garment atomically: only one concurrent sale can flip isSold.
      const garment = await garmentModel.findOneAndUpdate(
        { _id: input.garmentId, isSold: false, deletedAt: null },
        { $set: { state: "VENDIDO", isSold: true } },
        { session, new: false },
      );
      if (!garment) throw new Error("La prenda no existe o ya fue vendida.");

      let baleId: string | undefined;
      if (garment.BaleId) {
        const bale = await baleModel.findOne({ _id: garment.BaleId }).session(session);
        if (!bale) throw new Error("El fardo de la prenda no existe.");

        const plan = planGarmentSaleStock(garment, bale);
        if (!plan.ok) throw new Error(plan.error);

        const typeField = `pieceTypes.${plan.pieceTypeIndex}.currentPieces`;
        const updated = await baleModel.findOneAndUpdate(
          {
            _id: bale._id,
            currentPieces: { $gte: plan.qty },
            [typeField]: { $gte: plan.qty },
          },
          {
            $inc: {
              currentPieces: -plan.qty,
              [typeField]: -plan.qty,
              ...(input.paymentState === "PAGADO" ? { income: input.price } : {}),
            },
          },
          { session, new: true },
        );
        if (!updated) throw new Error("Stock insuficiente en el fardo para este tipo de prenda.");
        baleId = String(bale._id);
      }

      const [sale] = await saleModel.create(
        [{ ...input, baleId }],
        { session },
      );
      return sale;
    });

    return newSale;
}

/** Changes a sale's payment state (PENDIENTE/PAGADO/CANCELADO) keeping stock and income consistent. */
export async function updatePaymentCore(saleId: string, to: PaymentState) {
    await connectDB();

    const updatedSale = await inTransaction(async (session) => {
      const sale = await saleModel.findOne({ _id: saleId, deletedAt: null }).session(session);
      if (!sale) throw new Error("Venta no encontrada");

      const effect = paymentTransition(sale.paymentState, to, sale.price);
      if (!effect) throw new Error(`Transición no permitida: ${sale.paymentState} → ${to}`);

      const garment = await garmentModel.findById(sale.garmentId).session(session);

      if (effect.restoreStock && garment) {
        await garmentModel.updateOne(
          { _id: garment._id },
          { $set: { state: "DISPONIBLE", isSold: false } },
          { session },
        );
      }

      if (sale.baleId) {
        const inc: Record<string, number> = {};
        if (effect.incomeDelta) inc.income = effect.incomeDelta;
        if (effect.restoreStock && garment) {
          const bale = await baleModel.findById(sale.baleId).session(session);
          const plan = bale && planGarmentSaleStock(garment, bale);
          if (plan?.ok) {
            inc.currentPieces = plan.qty;
            inc[`pieceTypes.${plan.pieceTypeIndex}.currentPieces`] = plan.qty;
          }
        }
        if (Object.keys(inc).length) {
          await baleModel.updateOne({ _id: sale.baleId }, { $inc: inc }, { session });
        }
      }

      sale.paymentState = to;
      await sale.save({ session });
      return sale;
    });

    return updatedSale;
}
