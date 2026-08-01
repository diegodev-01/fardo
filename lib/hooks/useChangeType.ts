"use client";

import { useEffect, useState } from "react";

export const useChangeType = () => {
  const [changeType, setChangeType] = useState<number>(0);

  useEffect(() => {
    const fetchChangeType = async () => {
      const rate = await getChangeType();
      setChangeType(rate);
    };

    fetchChangeType();
  }, []);

  return changeType;
};

const getChangeType = async (): Promise<number> => {
  const today = new Date().toISOString().split("T")[0];

  const cachedDate = localStorage.getItem("changeTypeDate");
  const cachedType = localStorage.getItem("changeType");

  if (cachedDate === today && cachedType !== null) {
    return JSON.parse(cachedType);
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CUCU_API_URL}/tc/oficial`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const rate = data.tc_oficial.base;

    localStorage.setItem("changeType", JSON.stringify(rate));
    localStorage.setItem("changeTypeDate", today);

    return rate;
  } catch (error) {
    console.error("Error al obtener el tipo de cambio:", error);

    if (cachedType !== null) {
      return JSON.parse(cachedType);
    }

    return (
      localStorage.getItem("changeType") &&
      JSON.parse(localStorage.getItem("changeType")!)
    );
  }
};
