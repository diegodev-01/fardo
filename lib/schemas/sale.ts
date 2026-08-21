import z from "zod";

export const saleSchema = z.object({
  garmentId: z.string().min(1, "Es obligatorio seleccionar una prenda"),
  customerId: z.string().min(1, "Es obligatorio seleccionar un cliente"),
  baleId: z.string().optional(),
  price: z.number().min(0, "El precio debe ser un número positivo"),
  paymentState: z.enum(["PENDIENTE", "PAGADO", "CANCELADO"]),
  comprobanteUrl: z.string().optional(),
  observations: z.string().optional(),
  deliveryId: z
    .string()
    .min(1, "Los datos de entrega son obligatorios")
    .optional(),
});

export type SaleSchemaType = z.infer<typeof saleSchema>;
