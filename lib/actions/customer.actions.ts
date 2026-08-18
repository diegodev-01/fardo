"use server";

import { createCustomer, getCustomers } from "@/lib/services/customer.service";
import { Customer } from "@/lib/schemas/customer";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(data: Customer) {
  try {
    const newCustomer = await createCustomer(data);

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
    const customers = await getCustomers();
    return { success: true, data: customers };
  } catch (error) {
    console.error("Error en getCustomersAction:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener clientes";
    return { success: false, error: message };
  }
}
