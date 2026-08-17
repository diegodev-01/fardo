"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ICustomer } from "@/lib/models/customer.model";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id");
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );

  useEffect(() => {
    if (customerId) {
      // Opcional: Obtener los detalles del cliente o buscarlos localmente
    }
  }, [customerId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 m-auto text-center flex flex-col items-center justify-center">
      <h2 className="text-lg font-semibold text-text/50">
        Seleccionar cliente
      </h2>
      {selectedCustomer ? (
        <div className="mt-4">
          <p>
            Nombre: {selectedCustomer.name} {selectedCustomer.lastname}
          </p>
          <p>Teléfono: {selectedCustomer.phone}</p>
        </div>
      ) : (
        <p className="mt-4 text-text/30">
          Selecciona un cliente de la lista para ver sus detalles.
        </p>
      )}
    </div>
  );
}
