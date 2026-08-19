"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useInventory } from "@/app/(dashboard)/_shared/inventory/inventory-context";
import { InventoryDetail } from "@/app/(dashboard)/_shared/inventory/components/inventory-detail";

export default function SalespersonInventoryDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "bale";
  const { bales, garmentCard, loading } = useInventory();

  const card =
    type === "garment"
      ? garmentCard
      : bales.find((b) => String(b._id) === params.id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text/50 font-mono text-sm">
        Cargando...
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex-1 flex items-center justify-center text-text/50 font-mono text-sm text-center px-4">
        No se encontró el elemento seleccionado.
      </div>
    );
  }

  return <InventoryDetail card={card} />;
}
