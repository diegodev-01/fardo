import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import { Customer, customerSchema } from "@/lib/schemas/customer";
import { createCustomerAction } from "@/lib/actions/customer.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const BOLIVIA_DEPARTAMENTOS: Record<string, string[]> = {
  Cochabamba: [
    "Cercado",
    "Quillacollo",
    "Sacaba",
    "Tiquipaya",
    "Colcapirhua",
    "Vinto",
  ],
  "La Paz": ["La Paz", "El Alto", "Viacha", "Achocalla", "Coroico"],
  "Santa Cruz": [
    "Santa Cruz de la Sierra",
    "Montero",
    "Warnes",
    "La Guardia",
    "Cotoca",
  ],
  Chuquisaca: ["Sucre", "Monteagudo", "Villa Serrano"],
  Oruro: ["Oruro", "Challapata", "Huanuni"],
  Potosí: ["Potosí", "Uyuni", "Villazón"],
  Tarija: ["Tarija", "Yacuiba", "Bermejo"],
  Beni: ["Trinidad", "Riberalta", "Guayaramerín"],
  Pando: ["Cobija", "Porvenir"],
};

const DEPARTAMENTOS = Object.keys(BOLIVIA_DEPARTAMENTOS);

interface CustomerFormProps {
  onSuccess?: (newCustomer: Customer) => void;
}

const CustomerForm = ({ onSuccess }: CustomerFormProps) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      lastname: "",
      phone: "",
      address: {
        department: "Cochabamba",
        address: undefined,
        city: undefined,
      },
      email: undefined,
    },
  });
  const selectedDepartment = watch("address.department");

  const handleFormSubmit = async (data: Customer) => {
  const cleanData: Customer = {
    ...data,
    email: data.email || undefined,
    address: {
      department: data.address?.department || undefined,
      city: data.address?.city || undefined,
      address: data.address?.address || undefined,
    },
  };

  const result = await createCustomerAction(cleanData);

  if (!result.success || !result.data) {
    console.error(result.error ?? "Failed to create customer");
    return;
  }

  if (onSuccess) {
    onSuccess(result.data as Customer);
  }
};
  return (
    <div className="p-4">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 font-mono"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputComponent
                label="Nombre"
                placeholder="Nombre del fardo o prenda, ejemplo: Fardo de camisetas, Camiseta Nike, etc."
                {...register("name")}
                error={errors.name?.message}
              />
            </div>
            <div>
              <InputComponent
                label="Apellido"
                placeholder="Apellido"
                {...register("lastname")}
                error={errors.lastname?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="department"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Departamento (envio)
              </label>
              <select
                id="department"
                {...register("address.department", {
                  onChange: () => setValue("address.city", ""),
                })}
                className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecciona un departamento</option>
                {DEPARTAMENTOS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
              {errors.address?.department && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.department.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Ciudad
              </label>
              <select
                id="city"
                disabled={!selectedDepartment}
                {...register("address.city")}
                className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="">
                  {selectedDepartment
                    ? "Selecciona una ciudad"
                    : "Elige un departamento primero"}
                </option>
                {(selectedDepartment
                  ? BOLIVIA_DEPARTAMENTOS[selectedDepartment]
                  : []
                ).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.address?.city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div>
              <InputComponent
                label="Dirección"
                placeholder="Calle, número, referencia..."
                {...register("address.address")}
                error={errors.address?.address?.message}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Numero de telefono
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="phone"
                    international
                    defaultCountry="BO"
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full p-2 text-sm bg-background border border-border rounded-md focus-within:ring-1 focus-within:ring-primary 
        [&_.PhoneInputCountrySelect]:bg-background 
        [&_.PhoneInputCountrySelect]:text-foreground 
        [&_.PhoneInputCountrySelect_option]:bg-background 
        [&_.PhoneInputCountrySelect_option]:text-foreground"
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <InputComponent
                label="Email"
                type="email"
                placeholder="example@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border mt-6">
            <ButtonComponent type="submit">Guardar Registro</ButtonComponent>
            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              className="px-4 py-2 text-xs text-danger/70 hover:text-text font-mono transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
