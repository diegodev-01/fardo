"use client";

import Link from "next/link";
import OrdersForm from "../components/orders-form";

export default function CreateOrderPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 sm:p-6 pb-4 border-b border-border shrink-0 bg-background">
        <Link
          href="/admin/customers"
          className="md:hidden shrink-0 text-xs font-mono text-text/60 hover:text-text px-2 py-1 border border-border rounded-md w-fit"
        >
          ← Volver
        </Link>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Crear venta</h2>
          <p className="text-xs text-text/70 font-mono mt-1">
            Ingresa la información de la venta para registrarlo en el sistema
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 overflow-y-auto">
        <OrdersForm />
      </div>
    </div>
  );
}
