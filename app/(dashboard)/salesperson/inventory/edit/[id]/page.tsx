"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InventoryForm } from "@/app/(dashboard)/_shared/inventory/components/inventory-form";
import { IBale } from "@/types/inventory";
import { getBaleByIdAction } from "@/lib/actions/bale.action";

export default function SalespersonBaleEditPage() {
  const [baleData, setBaleData] = useState<IBale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const fetchBaleData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getBaleByIdAction(params.id);

        if (!result.success) {
          throw new Error(
            result.error || "Error al obtener los datos del fardo",
          );
        }

        setBaleData(result.data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Error al obtener el fardo",
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBaleData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-sm text-text/60 font-mono">
        Cargando fardo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-sm text-red-500 font-mono">
        {error}
      </div>
    );
  }

  if (!baleData) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-sm text-text/60 font-mono">
        Fardo no encontrado
      </div>
    );
  }

  return (
    <InventoryForm
      data={{ ...baleData, type: "bale" }}
      basePath="/salesperson/inventory"
      hideSalespersonField={true}
    />
  );
}
