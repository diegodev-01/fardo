"use client";

import React from "react";
import { InventoryShell as SharedInventoryShell } from "@/app/(dashboard)/_shared/inventory/components/inventory-shell";

export function InventoryShell({ children }: { children: React.ReactNode }) {
  return (
    <SharedInventoryShell basePath="/admin/inventory">
      {children}
    </SharedInventoryShell>
  );
}
