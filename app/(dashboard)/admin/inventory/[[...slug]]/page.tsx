"use client";

import { CardComponent } from "@/components/common/card-component";
import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

interface InventoryProps {
  total?: number;
  actives?: number;
  completes?: number;
}

interface Piece {
  id: number;
  name: string;
  status: string;
  color: string;
  size: string;
  price: string;
  grade?: string;
}

export interface Card {
  id: number;
  title: string;
  status: string;
  description: string;
  cost: string;
  date: string;
  piecesNumber: number;
  pieces: Piece[];
  currentPieces: number;
  color: string;
  type: "garment" | "bale";
  income: number;
}

const garments: Card = {
  id: 0,
  type: "garment",
  title: "Prendas individuales",
  status: "Activo",
  description: "Prendas fuera de fardos",
  cost: "$150",
  date: "2023-06-03",
  piecesNumber: 75,
  pieces: [
    {
      id: 1,
      name: "Pantalón",
      status: "Disponible",
      color: "Azul",
      size: "M",
      price: "$20",
      grade: "A",
    },
    {
      id: 2,
      name: "Camisa",
      status: "Disponible",
      color: "Blanco",
      size: "L",
      price: "$15",
    },
    {
      id: 3,
      name: "Chaqueta",
      status: "Disponible",
      color: "Negro",
      size: "XL",
      price: "$25",
    },
  ],
  currentPieces: 50,
  color: "Verde",
  income: 500,
};

const cards: Card[] = [
  {
    id: 1,
    type: "bale",
    title: "Opción A",
    status: "Activo",
    description: "Descripción de la opción A",
    cost: "$100",
    date: "2023-06-01",
    piecesNumber: 50,
    pieces: [
      {
        id: 1,
        name: "Pieza 1",
        status: "Disponible",
        color: "Azul",
        size: "M",
        price: "$20",
      },
      {
        id: 2,
        name: "Pieza 2",
        status: "Disponible",
        color: "Blanco",
        size: "L",
        price: "$15",
      },
      {
        id: 3,
        name: "Pieza 3",
        status: "Disponible",
        color: "Negro",
        size: "XL",
        price: "$25",
      },
    ],
    currentPieces: 30,
    color: "Rojo",
    income: 300,
  },
  {
    id: 2,
    type: "bale",
    title: "Opción B",
    status: "Inactivo",
    description: "Descripción de la opción B",
    cost: "$200",
    date: "2023-06-02",
    piecesNumber: 100,
    pieces: [
      {
        id: 1,
        name: "Pieza 1",
        status: "Disponible",
        color: "Azul",
        size: "M",
        price: "$20",
      },
      {
        id: 2,
        name: "Pieza 2",
        status: "Vendido",
        color: "Blanco",
        size: "L",
        price: "$15",
      },
      {
        id: 3,
        name: "Pieza 3",
        status: "Disponible",
        color: "Negro",
        size: "XL",
        price: "$25",
      },
    ],
    currentPieces: 80,
    color: "Azul",
    income: 800,
  },
];

const allItems = [garments, ...cards];

const Inventory = ({
  total = 0,
  actives = 0,
  completes = 0,
}: InventoryProps) => {
  const router = useRouter();
  const params = useParams();

  const slug = params?.slug as string[] | undefined;
  const [type, id] = slug ?? [];

  const isRegistering = id === "register";

  const selectedCard = !isRegistering
    ? allItems.find((item) => item.type === type && item.id === Number(id)) ||
      null
    : null;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    state: "DISPONIBLE",
    totalQuantity: "",
    quantity: "1",
    weight: "",
    sendPrice: "",
  });

  console.log("los datitos: ", formData);

  const handleSelectCard = (card: Card) => {
    router.push(`/admin/inventory/${card.type}/${card.id}`);
  };

  const handleStartRegister = () => {
    router.push("/admin/inventory/bale/register");
  };

  const handleSwitchType = (newType: "bale" | "garment") => {
    router.push(`/admin/inventory/${newType}/register`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registrando nuevo elemento:", { type, ...formData });
    router.push("/admin/inventory");
  };

  const clasificated = 50;

  return (
    <div className="flex">
      <aside className="w-80 border-r border-border">
        <div className="flex justify-between items-center p-4">
          <h3 className="text-lg font-semibold">Prendas y fardos</h3>
          <ButtonComponent onClick={handleStartRegister}>
            + Nueva
          </ButtonComponent>
        </div>
        <div className="flex justify-around items-center p-4 border-t border-b border-border">
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
        <ul className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-150px)]">
          <li className="pb-5 mb-5 border-b border-border rounded-md relative">
            <CardComponent
              onClick={() => handleSelectCard(garments)}
              isSelected={
                selectedCard?.id === garments.id &&
                selectedCard?.type === garments.type
              }
            >
              <h3 className="font-mono text-sm">{garments.title}</h3>
              <p
                className={`absolute p-1 px-2 text-[10px] border rounded-xl right-2 top-2 ${
                  garments.status === "Activo"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                }`}
              >
                {garments.status}
              </p>
              <p className="font-mono text-xs text-text/70">
                {garments.description}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-mono text-sm">
                  <h5 className="text-[10px] font-medium text-text/50">
                    Costo:
                  </h5>
                  {garments.cost}
                </span>
                <span className="font-mono text-sm">
                  <h5 className="text-[10px] font-medium text-text/50">
                    Fecha:
                  </h5>
                  {garments.date}
                </span>
                <span className="font-mono text-sm">
                  <h5 className="text-[10px] font-medium text-text/50">
                    Piezas:
                  </h5>
                  {garments.piecesNumber}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="relative w-3/4 h-1 bg-text/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                    style={{
                      width: `${((garments.currentPieces / garments.piecesNumber) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-sm">
                  {(
                    (garments.currentPieces / garments.piecesNumber) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </CardComponent>
          </li>

          {cards.map((card) => (
            <li
              key={card.id}
              className="cursor-pointer"
              onClick={() => handleSelectCard(card)}
            >
              <CardComponent
                isSelected={
                  selectedCard?.id === card.id &&
                  selectedCard?.type === card.type
                }
              >
                <h3 className="font-mono text-sm">{card.title}</h3>
                <p
                  className={`absolute p-1 px-2 text-[10px] border rounded-xl right-2 top-2 ${
                    card.status === "Activo"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                  }`}
                >
                  {card.status}
                </p>
                <p className="font-mono text-xs text-text/70">
                  {card.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-mono text-sm">
                    <h5 className="text-[10px] font-medium text-text/50">
                      Costo:
                    </h5>
                    {card.cost}
                  </span>
                  <span className="font-mono text-sm">
                    <h5 className="text-[10px] font-medium text-text/50">
                      Fecha:
                    </h5>
                    {card.date}
                  </span>
                  <span className="font-mono text-sm">
                    <h5 className="text-[10px] font-medium text-text/50">
                      Piezas:
                    </h5>
                    {card.piecesNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="relative w-3/4 h-1 bg-text/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                      style={{
                        width: `${((card.currentPieces / card.piecesNumber) * 100).toFixed(1)}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm">
                    {((card.currentPieces / card.piecesNumber) * 100).toFixed(
                      1,
                    )}
                    %
                  </span>
                </div>
              </CardComponent>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 overflow-auto">
        {isRegistering ? (
          <div className="p-6">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold">
                  Registrar {type === "garment" ? "Prenda Individual" : "Fardo"}
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
                    type === "bale"
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
                    type === "garment"
                      ? "bg-background font-medium shadow-sm border border-border"
                      : "text-text/60 hover:text-text"
                  }`}
                >
                  Prenda
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono">
              <InputComponent
                label="Título / Nombre"
                name="name"
                required
                placeholder={
                  type === "garment"
                    ? "Ej. Lote Prendas Verano"
                    : "Ej. Fardo Opción C"
                }
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-medium text-text/70 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Descripción del contenido o detalles de ingreso..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputComponent
                  label="Precio ($)"
                  name="price"
                  required
                  placeholder="$0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />

                <div>
                  <label
                    htmlFor="state"
                    className="block text-xs font-medium text-text/70 mb-1"
                  >
                    Estado
                  </label>
                  <select
                    name="state"
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="DEFECTUOSO">Defectuoso</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="VENDIDO">Vendido</option>
                  </select>
                </div>

                {type === "bale" ? (
                  <>
                    <InputComponent
                      label="Número de piezas"
                      name="totalQuantity"
                      type="number"
                      required
                      placeholder="0"
                      value={formData.totalQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalQuantity: e.target.value,
                        })
                      }
                    />
                    <InputComponent
                      label="Peso"
                      name="weight"
                      type="number"
                      placeholder="Peso en Kg"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                    />
                    <InputComponent
                      label="Precio de envío"
                      name="sendPrice"
                      type="number"
                      placeholder="0Bs"
                      value={formData.sendPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, sendPrice: e.target.value })
                      }
                    />
                  </>
                ) : (
                  <InputComponent
                    label="Cantidad"
                    name="quantity"
                    type="number"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                  />
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
        ) : selectedCard ? (
          <>
            <div className="flex text-lg font-semibold px-6 py-5 border-b border-border gap-4 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold">
                    {selectedCard.title}
                  </h2>
                  <p
                    className={`p-1 px-2 text-[10px] border rounded-xl h-fit ${
                      selectedCard.status === "Activo"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                  >
                    {selectedCard.status}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-4 border-b border-border bg-primary-lighter/5">
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  INVERSION
                </p>
                <p className="font-mono text-sm">{selectedCard.cost}</p>
              </span>
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  PIEZAS
                </p>
                <p className="font-mono text-sm">
                  {selectedCard.currentPieces}/{selectedCard.piecesNumber}
                </p>
              </span>
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  DISPONIBLES
                </p>
                <p className="font-mono text-sm">
                  {selectedCard.piecesNumber - selectedCard.currentPieces}
                </p>
              </span>
              <span className="flex flex-col justify-center items-center">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text font-medium truncate">
                  INGRESOS/mes
                </p>
                <p className="font-mono text-sm">{selectedCard.income}</p>
              </span>
            </div>
            <article className="flex justify-between items-center p-2 border-b border-border gap-4">
              <div
                className={`relative w-full h-1 bg-text/10 rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                  style={{
                    width: `${clasificated}%`,
                  }}
                />
              </div>
              <span className="font-mono text-[10px] shrink-0">
                {clasificated}% CLASIFICADO
              </span>
            </article>
            <div>
              {selectedCard.piecesNumber > 0 ? (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Piezas</h3>
                  <ul className="flex flex-col gap-4">
                    {selectedCard.pieces.map((piece) => (
                      <li
                        key={piece.id}
                        className="relative p-2 border border-border rounded-md flex flex-col gap-1"
                      >
                        <h4 className="flex items-center font-mono text-sm font-semibold gap-3">
                          {piece.name}
                          <p
                            className={`flex items-center justify-center py-1 px-2 border rounded-2xl font-mono text-[10px] text-text/70 ${
                              piece.status === "Disponible"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                            }`}
                          >
                            {piece.status}
                          </p>
                        </h4>
                        <p className="font-mono text-[10px] text-text/70">
                          Grado: {piece.grade || "N/A"}
                        </p>
                        <p className="font-mono text-[10px] text-text/70">
                          {piece.size}-{piece.color}
                        </p>
                        <p className="absolute top-2 right-2 font-mono text-[10px] text-text/70">
                          {piece.price}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p className="text-lg font-semibold text-text/50">
                    No hay piezas disponibles
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-lg font-semibold text-text/50">
              Selecciona una opción o crea una nueva
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Inventory;
