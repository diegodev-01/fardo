"use client";

import { useState } from "react";
import { IDelivery } from "@/lib/models/delivery.model";
import { MapPin, Phone, User, Package, Filter } from "lucide-react";

export default function DeliveryList({
  deliveries,
}: {
  deliveries: IDelivery[];
}) {
  const [filter, setFilter] = useState<string>("todos");

  const filteredDeliveries =
    filter === "todos"
      ? deliveries
      : deliveries.filter((d) => d.deliveryMethod === filter);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "casillero":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "punto fijo":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "envio":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {deliveries.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-text/50 mr-2" />
          {["todos", "casillero", "punto fijo", "envio"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                filter === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-text/70 border-border hover:bg-background"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {!filteredDeliveries.length ? (
        <div className="flex flex-col items-center justify-center h-48 text-text/50">
          <Package className="w-12 h-12 mb-4 opacity-50" />
          <p>No hay métodos de entrega para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery._id}
              className={`bg-background border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow ${
                delivery.deliveryMethod === "casillero"
                  ? "border-amber-500/30"
                  : delivery.deliveryMethod === "punto fijo"
                  ? "border-blue-500/30"
                  : delivery.deliveryMethod === "envio"
                  ? "border-emerald-500/30"
                  : "border-border"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-text truncate pr-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  {delivery.name}
                </h3>
                <span
                  className={`text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wider border ${getMethodColor(
                    delivery.deliveryMethod
                  )}`}
                >
                  {delivery.deliveryMethod}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-sm text-text/70 mt-2">
                {delivery.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text/50" />
                    <span>{delivery.phone}</span>
                  </div>
                )}
                {delivery.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text/50" />
                    <span className="line-clamp-2">{delivery.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
