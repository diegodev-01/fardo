import z from "zod";

export const pieceTypeSchema = z.object({
  type: z.string().min(1, "Selecciona un tipo"),
  quantity: z.coerce
    .number({ error: "Debe ser número" })
    .min(1, "Mínimo 1"),
});

