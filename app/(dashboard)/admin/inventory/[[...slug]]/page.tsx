"use client";

import { CardComponent } from "@/components/common/card-component";
import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, InventoryFormData } from "@/lib/schemas/bale";
import {
  getBales,
  getGarments,
  getpieceTypes,
} from "@/lib/services/inventory.service";
import { IBale } from "@/lib/models/bale.model";
import { formatDate } from "@/lib/utils/formatters";
import { calculateClassificationProgress } from "@/lib/utils/calculate";

interface InventoryProps {
  total?: number;
  actives?: number;
  completes?: number;
}

export interface Piece {
  _id: number;
  name: string;
  status: string;
  color: string;
  size: string;
  price: string;
  grade?: string;
}

export interface Card extends IBale {
  type: "garment" | "bale";
  pieces?: Piece[];
}

const calculatePercentage = (current = 0, total = 0) => {
  if (!total || total === 0) return "0.0";
  return ((current / total) * 100).toFixed(1);
};

const GarmentListItem = React.memo(({
  garmentCard,
  isSelected,
  onSelect
}: {
  garmentCard: Card | undefined;
  isSelected: boolean;
  onSelect: (card: Card) => void;
}) => {
  if (!garmentCard) return null;
  return (
    <li
      className="pb-5 mb-5 border-b border-border rounded-md relative"
    >
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
        <div className="flex justify-between items-center mt-2">
          <span className="font-mono text-sm">
            <h5 className="text-[10px] font-medium text-text/50">Costo:</h5>
            {garmentCard.price}
          </span>
          <span className="font-mono text-sm">
            <h5 className="text-[10px] font-medium text-text/50">Agregado:</h5>
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
});

const BaleListItem = React.memo(({
  card,
  isSelected,
  onSelect
}: {
  card: Card;
  isSelected: boolean;
  onSelect: (card: Card) => void;
}) => {
  const pct = calculatePercentage(card.currentPieces, card.totalQuantity);
  return (
    <li
      className="cursor-pointer"
      onClick={() => onSelect(card)}
    >
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
        <div className="flex justify-between items-center mt-2">
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
});

const Inventory = ({
  total = 0,
  actives = 0,
  completes = 0,
}: InventoryProps) => {
  const [pieceOptions, setPieceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [bales, setBales] = useState<Card[]>([]);
  const [garmentCard, setGarmentCard] = useState<Card>();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  
  const [activeType, setActiveType] = useState<string>(slug?.[0] ?? "bale");
  const [activeId, setActiveId] = useState<string>(slug?.[1] ?? "register");

  // Keep URL in sync on first load, but don't react to further URL changes
  // to avoid Next.js router overhead for local UI state.

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pieceRes, balesRes, garmentsRes] = await Promise.all([
          getpieceTypes(),
          getBales(1, 10),
          getGarments(1, 10),
        ]);

        setPieceOptions(pieceRes);

        const formattedBales = (balesRes.data || []).map((bale: IBale) => ({
          ...bale,
          type: "bale" as const,
        }));
        setBales(formattedBales);

        const singleGarmentCard: Card = {
          _id: "garments-total",
          weight: 0,
          pieceTypes: [],
          sendPrice: 0,
          updatedAt: new Date(),
          deletedAt: null,
          type: "garment",
          name: "Prendas individuales",
          state: "DISPONIBLE",
          description: "Prendas fuera de fardos",
          price: garmentsRes.info?.totalCost || 0,
          createdAt: new Date(),
          totalQuantity: garmentsRes.info?.totalQuantity || 0,
          currentPieces: garmentsRes.info?.totalDocs || 0,
          pieces: garmentsRes.pieces || [],
          income: 0,
        };

        setGarmentCard(singleGarmentCard);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeId && activeId !== "register") {
      if (activeType === "garment") {
        setSelectedCard(garmentCard || null);
      } else {
        const foundBale = bales.find((b: Card) => b._id === activeId);
        if (foundBale) setSelectedCard(foundBale);
      }
    } else {
      setSelectedCard(null);
    }
  }, [activeId, activeType, bales, garmentCard]);

  const isRegistering = activeId === "register";

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: activeType === "garment" ? "garment" : "bale",
      name: "",
      description: "",
      price: "",
      state: "DISPONIBLE",
      quantity: 1,
      totalQuantity: undefined,
      baleId: "",
      weight: "",
      sendPrice: "",
      pieceTypes: [],
      size: "",
      garmentType: "",
      grade: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pieceTypes",
  });

  useEffect(() => {
    reset({
      type: activeType === "garment" ? "garment" : "bale",
      name: "",
      description: "",
      price: "",
      state: "DISPONIBLE",
      totalQuantity: undefined,
      quantity: 1,
      baleId: "",
      weight: "",
      sendPrice: "",
      pieceTypes: [],
      size: "",
      garmentType: "",
      grade: "",
    });
  }, [activeType, reset]);

  const watchPieceTypes = watch("pieceTypes") || [];
  const watchTotalQuantity = watch("totalQuantity") || 0;

  const totalAllocated = watchPieceTypes.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0,
  );
  const targetTotal = Number(watchTotalQuantity) || 0;

  const handleSelectCard = React.useCallback((card: Card) => {
    setActiveType(card.type);
    setActiveId(card._id);
    setSelectedCard(card);
    window.history.pushState(null, '', `/admin/inventory/${card.type}/${card._id}`);
  }, []);

  const handleStartRegister = () => {
    setActiveType("bale");
    setActiveId("register");
    window.history.pushState(null, '', "/admin/inventory/bale/register");
  };

  const handleSwitchType = (newType: "bale" | "garment") => {
    setActiveType(newType);
    setActiveId("register");
    window.history.pushState(null, '', `/admin/inventory/${newType}/register`);
  };

  const handleAddPieceType = (selectedType: string) => {
    if (!selectedType) return;
    if (watchPieceTypes.some((p) => p.type === selectedType)) return;
    append({ type: selectedType, quantity: 1 });
  };

  const handleFormSubmit = async (data: InventoryFormData) => {
    try {
      const endpoint =
        activeType === "garment" ? "/api/inventory/garments" : "/api/inventory/bales";

      const payload =
        activeType === "garment"
          ? {
              name: data.name,
              description: data.description,
              price: Number(data.price) || 0,
              state: data.state,
              quantity: Number(data.quantity) || 1,
              baleId: data.baleId || undefined,
              size: data.size || undefined,
              garmentType: data.garmentType || undefined,
              grade: data.grade || undefined,
            }
          : data;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Ocurrió un error al registrar");
        return;
      }

      router.push("/admin/inventory");
      router.refresh();
    } catch (error) {
      console.error("Error de red:", error);
    }
  };



  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-80 border-r border-border flex flex-col shrink-0 h-full">
        <div className="flex justify-between items-center p-4 shrink-0">
          <h3 className="text-lg font-semibold">Prendas y fardos</h3>
          <ButtonComponent onClick={handleStartRegister}>
            + Nueva
          </ButtonComponent>
        </div>
        <div className="flex justify-around items-center p-4 border-t border-b border-border shrink-0">
          <span className="flex flex-col items-center w-20">
            <h2 className="text-xl font-semibold">{total}</h2>
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
              TOTAL
            </p>
          </span>
          <span className="flex flex-col items-center w-20">
            <h2 className="text-xl font-semibold">{actives}</h2>
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
              ACTIVAS
            </p>
          </span>
          <span className="flex flex-col items-center w-20">
            <h2 className="text-xl font-semibold">{completes}</h2>
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
              COMPLETAS
            </p>
          </span>
        </div>
        <ul className="p-4 space-y-2 overflow-y-auto flex-1">
          <GarmentListItem
            garmentCard={garmentCard}
            isSelected={
              selectedCard?._id === "garments-total" &&
              selectedCard?.type === "garment"
            }
            onSelect={handleSelectCard}
          />

          {bales.map((card, index) => (
            <BaleListItem
              key={`bale-${card._id || index}`}
              card={card}
              isSelected={
                selectedCard?._id === card._id &&
                selectedCard?.type === card.type
              }
              onSelect={handleSelectCard}
            />
          ))}
        </ul>
      </aside>

      <section className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div key={`${activeType}-${activeId}`} className="flex-1 flex flex-col h-full animate-fade-slide">
          {isRegistering ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-6 pb-4 border-b border-border shrink-0 bg-background">
                <div>
                  <h2 className="text-xl font-semibold">
                    Registrar {activeType === "garment" ? "Prenda Individual" : "Fardo"}
                  </h2>
                <p className="text-xs text-text/70 font-mono mt-1">
                  Ingresa la información inicial para el inventario
                </p>
              </div>

              <div className="flex p-1 bg-border/30 rounded-lg gap-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleSwitchType("bale")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeType === "bale"
                      ? "bg-background font-medium shadow-sm border border-border"
                      : "text-text/60 hover:text-text"
                  }`}
                >
                  Fardo
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchType("garment")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeType === "garment"
                      ? "bg-background font-medium shadow-sm border border-border"
                      : "text-text/60 hover:text-text"
                  }`}
                >
                  Prenda
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4 font-mono"
              >
                <div>
                  <InputComponent
                    label="Título / Nombre"
                    placeholder={
                      activeType === "garment"
                        ? "Ej. Lote Prendas Verano"
                        : "Ej. Fardo Opción C"
                    }
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-xs font-medium text-text/70 mb-1"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Descripción del contenido o detalles de ingreso..."
                    {...register("description")}
                    className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputComponent
                      label="Precio ($)"
                      placeholder="$0.00"
                      {...register("price")}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-xs font-medium text-text/70 mb-1"
                    >
                      Estado
                    </label>
                    <select
                      id="state"
                      {...register("state")}
                      className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="DEFECTUOSO">Defectuoso</option>
                      <option value="RESERVADO">Reservado</option>
                      <option value="VENDIDO">Vendido</option>
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  {activeType === "bale" ? (
                    <>
                      <div>
                        <InputComponent
                          label="Número de piezas totales"
                          type="number"
                          placeholder="0"
                          {...register("totalQuantity")}
                        />
                        {errors.totalQuantity && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.totalQuantity.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <InputComponent
                          label="Peso"
                          type="number"
                          placeholder="Peso en Kg"
                          {...register("weight")}
                          error={errors.weight?.message}
                        />
                      </div>

                      <div className="col-span-2 space-y-3 p-3 bg-border/10 border border-border rounded-md">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-medium text-text/80">
                            Desglose por tipos de prenda
                          </label>
                          {targetTotal > 0 && (
                            <span
                              className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                                totalAllocated === targetTotal
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : totalAllocated > targetTotal
                                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              }`}
                            >
                              {totalAllocated} / {targetTotal} pcs
                            </span>
                          )}
                        </div>

                        <select
                          value=""
                          onChange={(e) => handleAddPieceType(e.target.value)}
                          className="w-full p-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option key="select-option" value="" disabled>
                            + Seleccionar tipo para agregar...
                          </option>
                          {pieceOptions
                            .filter(
                              (opt) =>
                                !watchPieceTypes.some(
                                  (p) => p.type === opt.value,
                                ),
                            )
                            .map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                        </select>

                        {fields.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {fields.map((field, idx) => {
                              const optLabel =
                                pieceOptions.find((o) => o.value === field.type)
                                  ?.label || field.type;
                              return (
                                <div
                                  key={field.id}
                                  className="flex items-center gap-2 bg-background p-2 border border-border rounded-md"
                                >
                                  <span className="text-xs font-medium w-1/2 truncate">
                                    {optLabel}
                                  </span>
                                  <InputComponent
                                    type="number"
                                    placeholder="Cantidad"
                                    {...register(
                                      `pieceTypes.${idx}.quantity` as const,
                                    )}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => remove(idx)}
                                    className="p-1 px-2 text-red-500 hover:bg-red-500/10 rounded text-xs transition-colors"
                                    title="Eliminar"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(errors.pieceTypes?.root?.message ||
                          errors.pieceTypes?.message) && (
                          <p className="text-red-500 text-xs font-sans mt-1">
                            {errors.pieceTypes?.root?.message ||
                              errors.pieceTypes?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <InputComponent
                          label="Precio de envío"
                          type="number"
                          placeholder="0Bs"
                          {...register("sendPrice")}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <InputComponent
                          label="Cantidad"
                          type="number"
                          placeholder="1"
                          {...register("quantity")}
                        />
                        {errors.quantity && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.quantity.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <InputComponent
                          label="Talla"
                          placeholder="Ej. M, L, 42"
                          {...register("size")}
                        />
                      </div>
                      <div>
                        <InputComponent
                          label="Tipo de Prenda"
                          placeholder="Ej. Polera, Jeans"
                          {...register("garmentType")}
                        />
                      </div>
                      <div>
                        <InputComponent
                          label="Grado"
                          placeholder="Ej. Premium, A, B"
                          {...register("grade")}
                        />
                      </div>
                      <div className="col-span-2">
                        <label
                          htmlFor="baleId"
                          className="block text-xs font-medium text-text/70 mb-1"
                        >
                          ¿Pertenece a un fardo? (Opcional)
                        </label>
                        <select
                          id="baleId"
                          {...register("baleId")}
                          className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">No, es individual</option>
                          {bales.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.name} ({b.currentPieces}/{b.totalQuantity} piezas)
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  <ButtonComponent type="submit">
                    Guardar Registro
                  </ButtonComponent>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/inventory")}
                    className="px-4 py-2 text-xs text-text/70 hover:text-text font-mono transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : selectedCard ? (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex text-lg font-semibold px-6 py-5 border-b border-border gap-4 items-center shrink-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold">{selectedCard.name}</h2>
                  <p
                    className={`p-1 px-2 text-[10px] border rounded-xl h-fit ${
                      selectedCard.state === "DISPONIBLE"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                  >
                    {selectedCard.state &&
                      selectedCard.state.trim().charAt(0).toUpperCase() +
                        selectedCard.state.trim().slice(1).toLowerCase()}
                  </p>
                </div>
                <p className="text-text/70 text-sm font-light font-mono">
                  {selectedCard.description}
                </p>
              </div>
              <div className="ml-auto">
                <ButtonComponent>Filtro rápido</ButtonComponent>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-4 border-b border-border bg-primary-lighter/5 shrink-0">
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  INVERSIÓN
                </p>
                <p className="font-mono text-sm">{selectedCard.price}</p>
              </span>
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  PIEZAS
                </p>
                <p className="font-mono text-sm">
                  {selectedCard.currentPieces}/{selectedCard.totalQuantity}
                </p>
              </span>
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  DISPONIBLES
                </p>
                <p className="font-mono text-sm">
                  {selectedCard.totalQuantity - selectedCard.currentPieces}
                </p>
              </span>
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  INGRESOS/mes
                </p>
                <p className="font-mono text-sm">{selectedCard.income}</p>
              </span>
            </div>

            {(() => {
              const clasificated =
                calculateClassificationProgress(selectedCard);

              return (
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
              );
            })()}

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3">Piezas</h3>
              {selectedCard.pieces && selectedCard.pieces.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {selectedCard.pieces.map((piece) => (
                    <li
                      key={piece._id}
                      className="relative p-3 border border-border rounded-md flex flex-col gap-1 bg-background"
                    >
                      <h4 className="flex items-center font-mono text-sm font-semibold gap-3">
                        {piece.name}
                        <span
                          className={`flex items-center justify-center py-0.5 px-2 border rounded-2xl font-mono text-[10px] ${
                            piece.status === "Disponible"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                        >
                          {piece.status}
                        </span>
                      </h4>
                      <p className="font-mono text-[10px] text-text/70">
                        Grado: {piece.grade || "N/A"}
                      </p>
                      <p className="font-mono text-[10px] text-text/70">
                        {piece.size} - {piece.color}
                      </p>
                      <span className="absolute right-3 bottom-3 font-mono text-xs font-semibold">
                        ${piece.price}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text/50 font-mono italic">
                  No hay piezas individuales registradas en este elemento.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text/50 font-mono text-sm">
            Selecciona una opción del panel izquierdo
          </div>
        )}
        </div>
      </section>
    </div>
  );
};

export default Inventory;
