"use client";

import React, { useState } from "react";
import { CardComponent } from "@/components/common/card-component";
import { formatDate } from "@/lib/utils/formatters";
import { calculatePercentage, Card } from "../lib/types";
import { Edit, Trash2, Loader2 } from "lucide-react";

export const GarmentListItem = React.memo(
  ({
    garmentCard,
    isSelected,
    onSelect,
    onDelete,
    onEdit,
  }: {
    garmentCard: Card | undefined;
    isSelected: boolean;
    onSelect: (card: Card) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
  }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!garmentCard) return null;
    return (
      <li className="pb-5 mb-5 border-b border-border rounded-md relative group">
        <CardComponent
          onClick={() => onSelect(garmentCard)}
          isSelected={isSelected}
        >
          <div className="flex justify-between items-start pr-12">
            <h3 className="font-mono text-sm">
              {garmentCard.name || "Prendas individuales"}
            </h3>
            <p
              className={`p-1 px-2 text-[10px] border rounded-xl ${
                (garmentCard.totalQuantity ?? 0) > 0
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 border-red-500/20"
              }`}
            >
              {(garmentCard.totalQuantity ?? 0) > 0 ? "Disponible" : "Sin piezas"}
            </p>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Ocultamos los botones de editar y eliminar para el "garmentCard" que es un agrupador general 
                A menos que el usuario realmente quiera eliminar todas las prendas sueltas, lo cual es peligroso.
                Pero por si acaso los dejamos listos o comentados */}
          </div>

          <p className="font-mono text-xs text-text/70 mt-1">
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
    onDelete,
    onEdit,
  }: {
    card: Card;
    isSelected: boolean;
    onSelect: (card: Card) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
  }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const pct = calculatePercentage(card.currentPieces, card.totalQuantity);
    
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete && card._id) {
        setIsDeleting(true);
        onDelete(String(card._id));
      }
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEdit && card._id) {
        onEdit(String(card._id));
      }
    };

    return (
      <li className="cursor-pointer relative group" onClick={() => onSelect(card)}>
        <CardComponent isSelected={isSelected}>
          <div className="flex justify-between items-start pr-12">
            <h3 className="font-mono text-sm">{card.name}</h3>
            <p
              className={`p-1 px-2 text-[10px] border rounded-xl ${
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

          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 bg-background border border-border rounded-md text-text/60 hover:text-primary transition-colors"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 bg-background border border-border rounded-md text-red-500/70 hover:text-red-500 transition-colors"
              title="Eliminar"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <p className="font-mono text-xs text-text/70 mt-1">{card.description}</p>
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
