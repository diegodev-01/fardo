import z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastname: z.string().min(1, "El apellido es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.object({
    department: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
  email: z.string().email("El email no es válido").optional().or(z.literal("")),
});

export type Customer = z.infer<typeof customerSchema>;
