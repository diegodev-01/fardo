"use client";

import { ButtonComponent } from "@/components/ui/button-component";
import { MapPinPlus } from "lucide-react";

export function DeliveryMethodsHeader() {
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Métodos de Entrega
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona los lugares donde tus clientes pueden recoger sus pedidos.
        </p>
      </div>
      <ButtonComponent onClick={() => {}}>
        <MapPinPlus className="h-5 w-5" />
        Nuevo Método
      </ButtonComponent>
    </div>
  );
}
