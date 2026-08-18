"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { InventoryAside } from "./inventory-aside";
import { useInventory } from "../inventory-context";

export function InventoryShell({ children }: { children: React.ReactNode }) {
  const { showListMobile } = useInventory();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <InventoryAside />
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
