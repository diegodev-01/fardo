export const getpieceTypes = async () => {
  try {
    const response = await fetch("/api/config/piece-types", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los tipos de prendas");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getpieceTypes:", error);
    throw error;
  }
};

export const getBales = async (page: number, limit: number) => {
  try {
    const response = await fetch(
      `/api/inventory/bales?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al obtener los fardos");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getBales:", error);
    throw error;
  }
};

export const getGarments = async (page: number, limit: number) => {
  try {
    const response = await fetch(
      `/api/inventory/garments?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error al obtener las prendas");
    }

    const data = await response.json();
    console.log("los garments: ", data);

    return {
      pieces: data.data,
      info: data.info,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Error en getGarments:", error);
    throw error;
  }
};
