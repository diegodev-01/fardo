import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import {
  SearchableSelect,
  SelectOption,
} from "@/components/ui/form/searchable-select";
import { Customer } from "@/lib/schemas/customer";
import { saleSchema, SaleSchemaType } from "@/lib/schemas/sale";
import { createCustomer } from "@/lib/services/customer.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const INITIAL_CUSTOMERS: SelectOption[] = [
  { value: "cust_1", label: "Juan Pérez", searchTerms: "76543210 customer1" },
  { value: "cust_2", label: "María Gómez", searchTerms: "71234567 customer2" },
  { value: "cust_3", label: "Carlos López", searchTerms: "78901234 customer3" },
];

const garments: SelectOption[] = [
  { value: "garment_1", label: "Camisa Azul", searchTerms: "camisa azul" },
  {
    value: "garment_2",
    label: "Pantalón Negro",
    searchTerms: "pantalón negro",
  },
];

const deliverys: SelectOption[] = [
  {
    value: "delivery_1",
    label: "Entrega a domicilio",
    searchTerms: "entrega domicilio",
  },
  {
    value: "delivery_2",
    label: "Retiro en tienda",
    searchTerms: "retiro tienda",
  },
];

const paymentStates = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGADO", label: "Pagado" },
];

const OrdersForm = () => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customers, setCustomers] = useState<SelectOption[]>(INITIAL_CUSTOMERS);
  const [newCustomerName, setNewCustomerName] = useState("");

  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: "",
      garmentId: "",
      deliveryId: "",
      price: 0,
      paymentState: "PENDIENTE",
      observations: "",
    },
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const newId = `cust_${Date.now()}`;
    const newOption: SelectOption = {
      value: newId,
      label: newCustomerName,
      searchTerms: `${newCustomerName} nuevo`,
    };

    // 1. Agregar a la lista disponible
    setCustomers((prev) => [...prev, newOption]);

    // 2. Auto-seleccionar en el formulario inmediatamente
    setValue("customerId", newId, { shouldValidate: true });

    // 3. Limpiar y cerrar modal
    setNewCustomerName("");
    setIsCustomerModalOpen(false);
  };

  const handleFormSubmit = (data: SaleSchemaType) => {
    console.log("Datos del formulario:", data);
  };

  return (
    <div className="p-4">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 font-mono"
        >
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div className="flex gap-2">
              <span className="flex-1">
                <label className="block text-xs font-medium text-text/70 mb-1">
                  Cliente
                </label>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={customers}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Buscar o seleccionar cliente..."
                      error={errors.customerId?.message}
                    />
                  )}
                />
              </span>
              <span className="flex items-end">
                <ButtonComponent
                  type="button"
                  style="secondary"
                  onClick={() => setIsCustomerModalOpen(true)}
                >
                  Nuevo cliente
                </ButtonComponent>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="flex-1">
                <label className="block text-xs font-medium text-text/70 mb-1">
                  Prenda
                </label>
                <Controller
                  name="garmentId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={garments}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Buscar o seleccionar prenda..."
                      error={errors.garmentId?.message}
                    />
                  )}
                />
              </span>
              <span className="flex items-end">
                <ButtonComponent
                  type="button"
                  style="secondary"
                  // onClick={() => setIsGarmentModalOpen(true)}
                >
                  Nueva prenda
                </ButtonComponent>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="flex-1">
                <label className="block text-xs font-medium text-text/70 mb-1">
                  Entrega
                </label>
                <Controller
                  name="deliveryId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={deliverys}
                      value={field.value!}
                      onChange={field.onChange}
                      placeholder="Buscar o seleccionar entrega..."
                      error={errors.deliveryId?.message}
                    />
                  )}
                />
              </span>
              <span className="flex items-end">
                <ButtonComponent
                  type="button"
                  style="secondary"
                  // onClick={() => setIsDeliveryModalOpen(true)}
                >
                  Nuevo tipo de entrega
                </ButtonComponent>
              </span>
            </div>
            <div>
              <label
                htmlFor="paymentState"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Estado de pago
              </label>
              <select
                id="paymentState"
                {...register("paymentState")}
                className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecciona el estado del pago</option>
                {paymentStates.map((dep) => (
                  <option key={dep.value} value={dep.value}>
                    {dep.label}
                  </option>
                ))}
              </select>
              {errors.paymentState && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.paymentState.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputComponent
                label="Precio final (Bs.)"
                type="number"
                placeholder="Precio final en Bs., ejemplo: 100.00"
                {...register("price")}
                error={errors.price?.message}
              />
            </div>
            <div>
              <InputComponent
                label="Observaciones"
                placeholder="Observaciones sobre el pedido"
                {...register("observations")}
                error={errors.observations?.message}
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

export default OrdersForm;
