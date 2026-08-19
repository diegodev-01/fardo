import React from "react";
import { InventoryProvider } from "@/app/(dashboard)/_shared/inventory/inventory-context";
import { InventoryShell } from "@/app/(dashboard)/_shared/inventory/components/inventory-shell";

export default function SalespersonInventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InventoryProvider>
      <InventoryShell basePath="/salesperson/inventory">
        {children}
      </InventoryShell>
    </InventoryProvider>
  );
}
