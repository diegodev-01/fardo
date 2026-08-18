"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getBales,
  getGarments,
  getpieceTypes,
} from "@/lib/services/inventory.service";
import { IBale } from "@/lib/models/bale.model";
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

  const fetchData = async (currentPage = page) => {
    try {
      setLoading(true);
      const [pieceRes, balesRes, garmentsRes] = await Promise.all([
        getpieceTypes(),
        getBales(currentPage, 10),
        getGarments(1, 10),
      ]);

      setPieceOptions(pieceRes);

      setTotalPages(balesRes.info?.totalPages || 1);

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
        color: "#000000",
        state: "DISPONIBLE",
        description: "Prendas fuera de fardos",
        price: garmentsRes.info?.totalCost || 0,
        createdAt: new Date(),
        totalQuantity: garmentsRes.info?.totalQuantity || 0,
        availableQuantity: garmentsRes.info?.availableQuantity || 0,
        currentPieces: garmentsRes.info?.totalDocs || 0,
        pieces: garmentsRes.pieces || [],
        income: 0,
      };

      setGarmentCard(singleGarmentCard);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        const [pieceRes, balesRes, garmentsRes] = await Promise.all([
          getpieceTypes(),
          getBales(page, 10),
          getGarments(1, 10),
        ]);

        if (cancelled) return;

        setPieceOptions(pieceRes);
        setTotalPages(balesRes.info?.totalPages || 1);

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
          color: "#000000",
          state: "DISPONIBLE",
          description: "Prendas fuera de fardos",
          price: garmentsRes.info?.totalCost || 0,
          createdAt: new Date(),
          totalQuantity: garmentsRes.info?.totalQuantity || 0,
          availableQuantity: garmentsRes.info?.availableQuantity || 0,
          currentPieces: garmentsRes.info?.totalDocs || 0,
          pieces: garmentsRes.pieces || [],
          income: 0,
        };

        setGarmentCard(singleGarmentCard);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [page]);
  const total = bales.length + (garmentCard ? 1 : 0);
  const actives =
    bales.filter((b) => b.state === "DISPONIBLE").length +
    (garmentCard?.state === "DISPONIBLE" ? 1 : 0);
  const completes = bales.filter(
    (b) =>
      (b.totalQuantity ?? 0) > 0 &&
      (b.currentPieces ?? 0) >= (b.totalQuantity ?? 0),
  ).length;

  return (
    <InventoryContext.Provider
      value={{
        pieceOptions,
        bales,
        garmentCard,
        loading,
        total,
        actives,
        completes,
        showListMobile,
        setShowListMobile,
        refresh: fetchData,
        page,
        setPage,
        totalPages,
      }}
    >
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
