"use client";

import { ISale } from "@/lib/models/sale.model";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "react-phone-number-input/style.css";

type OrderData = {
  quantity: number;
  orders: { _id: string; type: string }[];
};

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

const OrderDetailPage = ({ params }: OrderDetailPageProps) => {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id");
  const [selectedOrder, setSelectedOrder] = useState<ISale | null>(null);

  useEffect(() => {
    if (customerId) {
      // Opcional: Obtener los detalles del cliente o buscarlos localmente
    }
  }, [customerId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 m-auto text-center flex flex-col items-center justify-center">
      <h2 className="text-lg font-semibold text-text/50">Seleccionar venta</h2>
      {selectedOrder ? (
        <div className="mt-4">
          <p>
            Estado: {selectedOrder.paymentState} - {selectedOrder.price || ""}
          </p>
          <p>Observaciones: {selectedOrder.observations}</p>
        </div>
      ) : (
        <p className="mt-4 text-text/30">
          Selecciona una venta de la lista para ver sus detalles.
        </p>
      )}
    </div>
  );
};

export default OrderDetailPage;
