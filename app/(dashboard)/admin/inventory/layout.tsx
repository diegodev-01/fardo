import React from "react";
import { InventoryProvider } from "@/app/(dashboard)/_shared/inventory/inventory-context";
import { InventoryShell } from "./components/inventory-shell";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InventoryProvider>
      <InventoryShell>{children}</InventoryShell>
    </InventoryProvider>
  );
}
