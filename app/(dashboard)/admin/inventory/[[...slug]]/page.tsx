"use client";

import { CardComponent } from "@/components/common/card-component";
import { ButtonComponent } from "@/components/ui/button-component";
import { useRouter, useParams } from "next/navigation";

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

  const selectedCard =
    allItems.find((item) => item.type === type && item.id === Number(id)) ||
    null;

  const handleSelectCard = (card: Card) => {
    router.push(`/admin/inventory/${card.type}/${card.id}`);
  };

  const clasificated = 50;

  return (
    <div className="flex">
      <aside className="w-80 h-screen border border-border">
        <div className="flex justify-between items-center p-4">
          <h3 className="text-lg font-semibold">Prendas y fardos</h3>
          <ButtonComponent>+ Nueva</ButtonComponent>
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
        <ul className="p-4 space-y-2">
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

      <section className="flex-1">
        {selectedCard ? (
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
                          <p className={`flex items-center justify-center py-1 px-2 border rounded-2xl font-mono text-[10px] text-text/70 ${piece.status === "Disponible" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
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
              Selecciona una opción para ver los detalles
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Inventory;
