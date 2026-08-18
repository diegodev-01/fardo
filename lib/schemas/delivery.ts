import z from "zod";

export const deliverySchema = z.object({
  name: z.string().min(1, "El nombre del destinatario es obligatorio"),
  phone: z.string().optional(),
  deliveryMethod: z.enum(["casillero", "punto fijo", "envio"]),
  address: z.string().optional(),
});

export type DeliverySchemaType = z.infer<typeof deliverySchema>;
