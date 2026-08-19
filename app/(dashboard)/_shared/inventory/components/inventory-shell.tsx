"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { InventoryAside } from "./inventory-aside";
import { useInventory } from "../inventory-context";

interface InventoryShellProps {
  children: React.ReactNode;
  basePath: string; // e.g. "/admin/inventory" or "/salesperson/inventory"
}

export function InventoryShell({ children, basePath }: InventoryShellProps) {
  const { showListMobile } = useInventory();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <InventoryAside basePath={basePath} />
      <section
        className={`${
          showListMobile ? "hidden" : "flex"
        } md:flex flex-1 flex-col h-full overflow-hidden relative`}
      >
        <div
          key={`${pathname}?${searchParams.toString()}`}
          className="flex-1 flex flex-col h-full animate-fade-slide"
        >
          {children}
        </div>
      </section>
    </div>
  );
}
