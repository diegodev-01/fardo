"use server";

import { createCustomer, getCustomers } from "@/lib/services/customer.service";
import { Customer } from "@/lib/schemas/customer";
import { revalidatePath } from "next/cache";
import { guard } from "@/lib/auth/guards";
import { customerSchema } from "@/lib/schemas/customer";

export async function createCustomerAction(data: Customer) {
  try {
    const g = await guard(["admin", "salesperson"]);
    if (!g.ok) return { success: false, error: g.error };

    const parsed = customerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Datos del cliente inválidos" };
    }
    const newCustomer = await createCustomer(parsed.data);

    // Revalida la lista de clientes para que se actualice la pantalla
    revalidatePath("/admin/customers");

    return { success: true, data: newCustomer };
  } catch (error) {
    console.error("Error en createCustomerAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear cliente";
    return { success: false, error: message };
  }
}

export async function getCustomersAction() {
  try {
    const g = await guard(["admin", "salesperson"]);
    if (!g.ok) return { success: false, error: g.error };

    const customers = await getCustomers();
    return { success: true, data: customers };
  } catch (error) {
    console.error("Error en getCustomersAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener clientes";
    return { success: false, error: message };
  }
}
