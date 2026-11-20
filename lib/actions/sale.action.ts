"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { guard } from "@/lib/auth/guards";
import type { PaymentState } from "@/lib/domain/sales";
import { createSaleCore, updatePaymentCore } from "@/lib/services/sale.service";
import type { SaleSchemaType } from "../schemas/sale";

type Fail = { success: false; error: string };

function toFail(error: unknown, fallback: string): Fail {
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    return { success: false, error: `Error de validación: ${issue.path.join(".")} - ${issue.message}` };
  }
  console.error(fallback, error);
  // Domain errors are thrown as plain Error with a user-facing message.
  return { success: false, error: error instanceof Error ? error.message : fallback };
}

async function revalidateSales() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/salesperson/inventory");
}

export async function createSaleAction(data: SaleSchemaType) {
  const g = await guard(["admin", "salesperson"]);
  if (!g.ok) return { success: false, error: g.error } as Fail;
  try {
    const sale = await createSaleCore(data);
    revalidateSales();
    return { success: true as const, data: JSON.parse(JSON.stringify(sale)) };
  } catch (error) {
    return toFail(error, "Error al crear la venta");
  }
}

/** Changes a sale's payment state keeping stock and income consistent. */
export async function updateSalePaymentAction(saleId: string, to: PaymentState) {
  const g = await guard(["admin", "salesperson"]);
  if (!g.ok) return { success: false, error: g.error } as Fail;
  try {
    const sale = await updatePaymentCore(saleId, to);
    revalidateSales();
    return { success: true as const, data: JSON.parse(JSON.stringify(sale)) };
  } catch (error) {
    return toFail(error, "Error al actualizar el pago");
  }
}
