import { z } from "zod";

const pieceTypeSchema = z.object({
  type: z.string().min(1, "Selecciona un tipo"),
  quantity: z.coerce.number().int().min(1, "Mínimo 1"),
});

export const formSchema = z
  .object({
    type: z.enum(["bale", "garment"]).default("bale"),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    description: z.string().optional(),
    price: z.string().min(1, "El precio es requerido"),
    state: z
      .enum(["DISPONIBLE", "DEFECTUOSO", "RESERVADO", "VENDIDO"])
      .default("DISPONIBLE"),
    // Campos para Prenda Individual
    quantity: z.coerce.number().int().min(1, "Mínimo 1").optional(),
    baleId: z.string().optional(),
    size: z.string().optional(),
    garmentType: z.string().optional(),
    grade: z.string().optional(),
    color: z.string().optional(),
    // Campos para Fardo
    totalQuantity: z.coerce.number().int().min(1, "El total de piezas es requerido").optional(),
    weight: z.string().optional(),
    sendPrice: z.string().optional(),
    pieceTypes: z.array(pieceTypeSchema).default([]),
  })
  .superRefine((data, ctx) => {
    // Validaciones exclusivas cuando es un FARDO
    if (data.type === "bale") {
      if (!data.totalQuantity || data.totalQuantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresa el número total de piezas del fardo",
          path: ["totalQuantity"],
        });
      }

      if (!data.weight || data.weight.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El peso es requerido",
          path: ["weight"],
        });
      }

      if (data.pieceTypes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agrega al menos un tipo de prenda al desglose",
          path: ["pieceTypes"],
        });
      }

      const allocated = data.pieceTypes.reduce(
        (acc, item) => acc + (Number(item.quantity) || 0),
        0,
      );

      if (data.totalQuantity && allocated > data.totalQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La suma de las prendas excede el total de piezas del fardo",
          path: ["pieceTypes"],
        });
      }

      if (data.totalQuantity && allocated < data.totalQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La suma de las prendas es menor al total de piezas del fardo",
          path: ["pieceTypes"],
        });
      }
    }
  });

export type InventoryFormData = z.infer<typeof formSchema>;
