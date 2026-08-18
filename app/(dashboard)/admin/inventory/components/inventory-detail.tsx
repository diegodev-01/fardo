"use client";

import React from "react";
import { ButtonComponent } from "@/components/ui/button-component";
import { calculateClassificationProgress } from "@/lib/utils/calculate";
import { useInventory } from "../inventory-context";
import { Card } from "../lib/types";

export function InventoryDetail({ card }: { card: Card }) {
  const { setShowListMobile } = useInventory();
  const clasificated = calculateClassificationProgress(card);

  const [pieceFilter, setPieceFilter] = React.useState<"todos" | "disponibles" | "vendidos">("todos");

  const filteredPieces = card.pieces?.filter((piece) => {
    if (pieceFilter === "todos") return true;
    if (pieceFilter === "disponibles") return piece.state === "DISPONIBLE";
    if (pieceFilter === "vendidos") return piece.state !== "DISPONIBLE";
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row text-lg font-semibold px-4 sm:px-6 py-5 border-b border-border gap-4 sm:items-center shrink-0">
        <button
          type="button"
          onClick={() => setShowListMobile(true)}
          className="md:hidden shrink-0 w-fit text-xs font-mono text-text/60 hover:text-text px-2 py-1 border border-border rounded-md"
        >
          ← Volver
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">{card.name}</h2>
            <p
              className={`p-1 px-2 text-[10px] border rounded-xl h-fit ${
                card.state === "DISPONIBLE"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 border-red-500/20"
              }`}
            >
              {card.state &&
                card.state.trim().charAt(0).toUpperCase() +
                  card.state.trim().slice(1).toLowerCase()}
            </p>
          </div>
          <p className="text-text/70 text-sm font-light font-mono">
            {card.description}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <select
            value={pieceFilter}
            onChange={(e) => setPieceFilter(e.target.value as any)}
            className="text-xs p-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="todos">Filtro rápido: Todos</option>
            <option value="disponibles">Solo Disponibles</option>
            <option value="vendidos">Solo Vendidos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-4 border-b border-border bg-primary-lighter/5 shrink-0">
        <span className="flex flex-col justify-center items-center">
          <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
            INVERSIÓN
          </p>
          <p className="font-mono text-sm">{card.price}</p>
        </span>
        <span className="flex flex-col justify-center items-center">
          <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
            PIEZAS
          </p>
          <p className="font-mono text-sm">
            {card.currentPieces}/{card.totalQuantity}
          </p>
        </span>
        <span className="flex flex-col justify-center items-center">
          <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
            DISPONIBLES
          </p>
          <p className="font-mono text-sm">{card.availableQuantity ?? 0}</p>
        </span>
        <span className="flex flex-col justify-center items-center">
          <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
            INGRESOS
          </p>
          <p className="font-mono text-sm">{card.income}</p>
        </span>
      </div>

      <article className="flex justify-between items-center p-2 border-b border-border gap-4 shrink-0">
        <div className="relative w-full h-1 bg-text/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
            style={{ width: `${clasificated}%` }}
          />
        </div>
        <span className="font-mono text-[10px] shrink-0">
          {clasificated}% CLASIFICADO
        </span>
      </article>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Piezas</h3>
          {pieceFilter !== "todos" && (
            <span className="text-xs text-text/60">
              Mostrando {filteredPieces?.length} de {card.pieces?.length || 0}
            </span>
          )}
        </div>
        {filteredPieces && filteredPieces.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredPieces.map((piece) => (
              <li
                key={piece._id}
                className="relative p-3 border border-border rounded-md flex flex-col gap-1 bg-background"
              >
                <h4 className="flex flex-wrap items-center font-mono text-sm font-semibold gap-3">
                  {piece.name}
                  <span
                    className={`flex items-center justify-center py-0.5 px-2 border rounded-2xl font-mono text-[10px] ${
                      piece.state === "DISPONIBLE"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                  >
                    {piece.state}
                  </span>
                </h4>
                <p className="font-mono text-[10px] text-text/70">
                  Grado: {piece.grade || "N/A"}
                </p>
                <p className="font-mono text-[10px] text-text/70">
                  {piece.size} - {piece.garmentType}
                </p>
                <span className="absolute right-3 bottom-3 font-mono text-xs font-semibold">
                  ${piece.price}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text/50 font-mono italic">
            No hay piezas registradas o que coincidan con el filtro actual.
          </p>
        )}
      </div>
    </div>
  );
}
