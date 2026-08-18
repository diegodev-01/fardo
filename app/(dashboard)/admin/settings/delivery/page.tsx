import { getDeliveriesAction } from "@/lib/actions/delivery.action";
import DeliveriesClient from "./components/deliveries-client";

export default async function DeliveriesPage() {
  const result = await getDeliveriesAction();
  const deliveries = result.success ? (result.data ?? []) : [];

  return (
    <div className="flex flex-col w-full h-full p-4 sm:p-6 bg-background overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Métodos de Entrega</h1>
        <p className="text-text/60 text-sm mt-1">
          Gestiona los métodos de entrega (casillero, punto fijo, envío).
        </p>
      </div>
      <DeliveriesClient initialDeliveries={deliveries} />
    </div>
  );
}
