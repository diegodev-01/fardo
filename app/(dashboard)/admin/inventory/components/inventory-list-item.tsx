"use client";

import React from "react";
import { CardComponent } from "@/components/common/card-component";
import { formatDate } from "@/lib/utils/formatters";
import { calculatePercentage, Card } from "../lib/types";

export const GarmentListItem = React.memo(
  ({
    garmentCard,
    isSelected,
    onSelect,
  }: {
    garmentCard: Card | undefined;
    isSelected: boolean;
    onSelect: (card: Card) => void;
  }) => {
    if (!garmentCard) return null;
    return (
      <li className="pb-5 mb-5 border-b border-border rounded-md relative">
        <CardComponent
          onClick={() => onSelect(garmentCard)}
          isSelected={isSelected}
        >
          <h3 className="font-mono text-sm">
            {garmentCard.name || "Prendas individuales"}
          </h3>
          <p
            className={`absolute p-1 px-2 text-[10px] border rounded-xl right-2 top-2 ${
              (garmentCard.totalQuantity ?? 0) > 0
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            }`}
          >
            {(garmentCard.totalQuantity ?? 0) > 0 ? "Disponible" : "Sin piezas"}
          </p>
          <p className="font-mono text-xs text-text/70">
            {garmentCard.description}
          </p>
          <div className="flex flex-wrap justify-between items-center gap-y-1 mt-2">
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">Costo:</h5>
              {garmentCard.price}
            </span>
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">
                Agregado:
              </h5>
              {garmentCard.createdAt ? formatDate(garmentCard.createdAt) : "-"}
            </span>
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">Piezas:</h5>
              {garmentCard.totalQuantity ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="relative w-3/4 h-1 bg-text/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                style={{
                  width: `${calculatePercentage(
                    garmentCard.currentPieces,
                    garmentCard.totalQuantity,
                  )}%`,
                }}
              />
            </div>
            <span className="font-mono text-sm">
              {calculatePercentage(
                garmentCard.currentPieces,
                garmentCard.totalQuantity,
              )}
              %
            </span>
          </div>
        </CardComponent>
      </li>
    );
  },
);
GarmentListItem.displayName = "GarmentListItem";

export const BaleListItem = React.memo(
  ({
    card,
    isSelected,
    onSelect,
  }: {
    card: Card;
    isSelected: boolean;
    onSelect: (card: Card) => void;
  }) => {
    const pct = calculatePercentage(card.currentPieces, card.totalQuantity);
    return (
      <li className="cursor-pointer" onClick={() => onSelect(card)}>
        <CardComponent isSelected={isSelected}>
          <h3 className="font-mono text-sm">{card.name}</h3>
          <p
            className={`absolute p-1 px-2 text-[10px] border rounded-xl right-2 top-2 ${
              card.state === "DISPONIBLE"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            }`}
          >
            {card.state &&
              card.state.trim().charAt(0).toUpperCase() +
                card.state.trim().slice(1).toLowerCase()}
          </p>
          <p className="font-mono text-xs text-text/70">{card.description}</p>
          <div className="flex flex-wrap justify-between items-center gap-y-1 mt-2">
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">Precio:</h5>
              {card.price}
            </span>
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">Fecha:</h5>
              {formatDate(card.createdAt)}
            </span>
            <span className="font-mono text-sm">
              <h5 className="text-[10px] font-medium text-text/50">Piezas:</h5>
              {card.totalQuantity}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="relative w-3/4 h-1 bg-text/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-sm">{pct}%</span>
          </div>
        </CardComponent>
      </li>
    );
  },
);
BaleListItem.displayName = "BaleListItem";
