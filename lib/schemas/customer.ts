import z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastname: z.string().min(1, "El apellido es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.object({
    department: z.string().min(1, "El departamento es requerido"),
    address: z.string().min(1, "La dirección es requerida"),
    city: z.string().min(1, "La ciudad es requerida"),
  }),
  email: z.string().email("El email no es válido").optional(),
});

export type Customer = z.infer<typeof customerSchema>;
