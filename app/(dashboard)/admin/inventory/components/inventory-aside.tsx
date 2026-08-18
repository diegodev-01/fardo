"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ButtonComponent } from "@/components/ui/button-component";
import { useInventory } from "../inventory-context";
import { Card } from "../lib/types";
import { BaleListItem, GarmentListItem } from "./inventory-list-item";

export function InventoryAside() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    bales,
    garmentCard,
    total,
    actives,
    completes,
    showListMobile,
    setShowListMobile,
  } = useInventory();

  // /admin/inventory/[id]  ->  segments = ["admin", "inventory", id]
  const segments = pathname.split("/").filter(Boolean);
  const activeId = segments[2];
  const activeType = searchParams.get("type") ?? "bale";

  const handleSelectCard = (card: Card) => {
    setShowListMobile(false);
    router.push(`/admin/inventory/${card._id}?type=${card.type}`);
  };

  const handleStartRegister = () => {
    setShowListMobile(false);
    router.push("/admin/inventory/register?type=bale");
  };

  return (
    <aside
      className={`${
        showListMobile ? "flex" : "hidden"
      } md:flex w-full md:w-80 border-r border-border flex-col shrink-0 h-full`}
    >
      <div className="flex justify-between items-center p-4 shrink-0 gap-2">
        <h3 className="text-base sm:text-lg font-semibold truncate">
          Prendas y fardos
        </h3>
        <div className="flex gap-2 sm:mr-0 mr-10">
          <ButtonComponent onClick={handleStartRegister}>
            + Nueva
          </ButtonComponent>
        </div>
      </div>
      <div className="flex justify-around items-center p-4 border-t border-b border-border shrink-0">
        <span className="flex flex-col items-center w-16 sm:w-20">
          <h2 className="text-lg sm:text-xl font-semibold">{total}</h2>
          <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
            TOTAL
          </p>
        </span>
        <span className="flex flex-col items-center w-16 sm:w-20">
          <h2 className="text-lg sm:text-xl font-semibold">{actives}</h2>
          <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
            ACTIVAS
          </p>
        </span>
        <span className="flex flex-col items-center w-16 sm:w-20">
          <h2 className="text-lg sm:text-xl font-semibold">{completes}</h2>
          <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
            COMPLETAS
          </p>
        </span>
      </div>
      <ul className="p-4 space-y-2 overflow-y-auto flex-1">
        <GarmentListItem
          garmentCard={garmentCard}
          isSelected={activeId === "garments-total" && activeType === "garment"}
          onSelect={handleSelectCard}
        />

        {bales.map((card, index) => (
          <BaleListItem
            key={`bale-${card._id || index}`}
            card={card}
            isSelected={activeId === String(card._id) && activeType === "bale"}
            onSelect={handleSelectCard}
          />
        ))}
      </ul>
    </aside>
  );
}
