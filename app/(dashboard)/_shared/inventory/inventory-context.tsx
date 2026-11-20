"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getBales,
  getGarments,
  getpieceTypes,
} from "@/lib/services/inventory.service";
import { IBale } from "@/types/inventory";
import { Card } from "./lib/types";

interface InventoryContextValue {
  pieceOptions: { label: string; value: string }[];
  bales: Card[];
  garmentCard: Card | undefined;
  loading: boolean;
  total: number;
  actives: number;
  completes: number;
  showListMobile: boolean;
  setShowListMobile: (value: boolean) => void;
  refresh: () => Promise<void>;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

async function fetchInventory(page: number) {
  const [pieceOptions, balesRes, garmentsRes] = await Promise.all([
    getpieceTypes(),
    getBales(page, 10),
    getGarments(1, 10),
  ]);

  const bales: Card[] = (balesRes.data || []).map((bale: IBale) => ({
    ...bale,
    type: "bale" as const,
  }));

  const info = garmentsRes.info ?? {};
  const garmentCard: Card = {
    _id: "garments-total",
    weight: 0,
    pieceTypes: [],
    singlePieces: 0,
    sendPrice: 0,
    updatedAt: new Date(),
    deletedAt: null,
    type: "garment",
    name: "Prendas individuales",
    color: "#000000",
    state: "DISPONIBLE",
    description: "Prendas fuera de fardos",
    price: info.totalCost || 0,
    createdAt: new Date(),
    totalQuantity: info.totalQuantity || 0,
    availableQuantity: info.availableQuantity || 0,
    // units still available over total units, so the progress bar stays within 0-100%
    currentPieces: info.availableQuantity || 0,
    pieces: garmentsRes.pieces || [],
    income: 0,
  };

  return {
    pieceOptions: pieceOptions as { label: string; value: string }[],
    bales,
    garmentCard,
    totalPages: balesRes.pagination?.totalPages || 1,
  };
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [pieceOptions, setPieceOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [bales, setBales] = useState<Card[]>([]);
  const [garmentCard, setGarmentCard] = useState<Card>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showListMobile, setShowListMobile] = useState(true);

  // Latest request wins: ignores slow responses from an older page/refresh.
  const requestId = useRef(0);
  const pageRef = useRef(page);

  const apply = useCallback((data: Awaited<ReturnType<typeof fetchInventory>>) => {
    setPieceOptions(data.pieceOptions);
    setBales(data.bales);
    setGarmentCard(data.garmentCard);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, []);

  useEffect(() => {
    pageRef.current = page;
    const id = ++requestId.current;
    fetchInventory(page)
      .then((data) => {
        if (id === requestId.current) apply(data);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
        if (id === requestId.current) setLoading(false);
      });
  }, [page, apply]);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const data = await fetchInventory(pageRef.current);
      if (id === requestId.current) apply(data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  }, [apply]);

  const total = bales.length + (garmentCard ? 1 : 0);
  const actives =
    bales.filter((b) => b.state === "DISPONIBLE").length +
    (garmentCard?.state === "DISPONIBLE" ? 1 : 0);
  const completes = bales.filter(
    (b) =>
      (b.totalQuantity ?? 0) > 0 &&
      (b.currentPieces ?? 0) >= (b.totalQuantity ?? 0),
  ).length;

  const value = useMemo(
    () => ({
      pieceOptions,
      bales,
      garmentCard,
      loading,
      total,
      actives,
      completes,
      showListMobile,
      setShowListMobile,
      refresh,
      page,
      setPage,
      totalPages,
    }),
    [
      pieceOptions,
      bales,
      garmentCard,
      loading,
      total,
      actives,
      completes,
      showListMobile,
      refresh,
      page,
      totalPages,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return ctx;
}
