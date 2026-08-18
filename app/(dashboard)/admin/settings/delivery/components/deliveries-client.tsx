"use client";

import { useState } from "react";
import { IDelivery } from "@/lib/models/delivery.model";
import { List, Plus } from "lucide-react";
import DeliveryList from "./delivery-list";
import DeliveryForm from "./delivery-form";

export default function DeliveriesClient({
  initialDeliveries,
}: {
  initialDeliveries: IDelivery[];
}) {
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");

  return (
    <div className="flex flex-col flex-1 w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
      <div className="flex border-b border-border bg-background/50">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeTab === "list"
              ? "border-b-2 border-primary text-primary"
              : "text-text/60 hover:text-text hover:bg-surface"
          }`}
        >
          <List className="w-4 h-4" />
          Vista de Lista
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeTab === "form"
              ? "border-b-2 border-primary text-primary"
              : "text-text/60 hover:text-text hover:bg-surface"
          }`}
        >
          <Plus className="w-4 h-4" />
          Crear Nuevo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === "list" ? (
          <DeliveryList deliveries={initialDeliveries} />
        ) : (
          <DeliveryForm onSuccess={() => setActiveTab("list")} />
        )}
      </div>
    </div>
  );
}
