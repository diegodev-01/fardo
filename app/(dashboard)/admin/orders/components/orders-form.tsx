"use client";

import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import {
  SearchableSelect,
  SelectOption,
} from "@/components/ui/form/searchable-select";
import { Modal } from "@/components/ui/modal";
import { ICustomer } from "@/lib/models/customer.model";
import { saleSchema, SaleSchemaType } from "@/lib/schemas/sale";
import { getCustomersAction } from "@/lib/actions/customer.actions";

import { getDeliveriesAction } from "@/lib/actions/delivery.action";
import { getGarmentsAction } from "@/lib/actions/garment.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomerForm from "../../customers/components/customer-form";

const paymentStates = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGADO", label: "Pagado" },
];

const OrdersForm = () => {
  const [activeModal, setActiveModal] = useState<
    "customer" | "garment" | "delivery" | null
  >(null);

  // Estados locales para almacenar los datos cargados desde la BD
  const [customersOptions, setCustomersOptions] = useState<SelectOption[]>([]);
  const [garmentsOptions, setGarmentsOptions] = useState<SelectOption[]>([]);
  const [deliveriesOptions, setDeliveriesOptions] = useState<SelectOption[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SaleSchemaType>({
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

  // 2. Carga inicial llamando al Server Action
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Llamada al Server Action (sin tocar la BD directamente desde el navegador)
        const customersData = await getCustomersAction();
        const garmentsData = await getGarmentsAction();
        const deliveriesData = await getDeliveriesAction();
        console.log(customersData);

        // Transformar clientes a SelectOption
        if (customersData && Array.isArray(customersData.data)) {
          const mappedCustomers: SelectOption[] = customersData.data.map(
            (c: any) => ({
              value: c._id,
              label: `${c.name} ${c.lastname}`,
              searchTerms: `${c.name} ${c.lastname} ${c.phone || ""}`,
            }),
          );
          setCustomersOptions(mappedCustomers);
        }

        if (garmentsData.data) {
          setGarmentsOptions(
            garmentsData.data.map((g: any) => ({
              value: g._id,
              label: g.name,
              searchTerms: `${g.name} ${g.code || ""}`,
            })),
          );
        }

        if (deliveriesData.data) {
          setDeliveriesOptions(
            deliveriesData.data.map((d: any) => ({
              value: d._id,
              label: d.name,
              searchTerms: d.name,
            })),
          );
        }
      } catch (error) {
        console.error("Error al cargar opciones del formulario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(customersOptions);

  // 3. Callback al crear un cliente nuevo desde el modal
  const handleCustomerCreated = (newCustomer: ICustomer) => {
    const newOption: SelectOption = {
      value: newCustomer._id!,
      label: `${newCustomer.name} ${newCustomer.lastname}`,
      searchTerms: `${newCustomer.name} ${newCustomer.lastname} ${newCustomer.phone || ""}`,
    };

    // Agregar a la lista del select
    setCustomersOptions((prev) => [...prev, newOption]);

    // Auto-seleccionar en el formulario
    setValue("customerId", newCustomer._id!, { shouldValidate: true });

    // Cerrar el modal
    setActiveModal(null);
  };

  // 4. Submit del formulario
  const handleFormSubmit = async (data: SaleSchemaType) => {
    console.log("Datos a guardar:", data);
    try {
      setIsLoading(true);
      const { createSaleAction } = await import("@/lib/actions/sale.action");
      const result = await createSaleAction(data);
      if (result.success) {
        router.push("/admin/orders");
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error al guardar la orden:", error);
    } finally {
      setIsLoading(false);
    }
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
                      options={customersOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={
                        isLoading
                          ? "Cargando clientes..."
                          : "Buscar o seleccionar cliente..."
                      }
                      error={errors.customerId?.message}
                    />
                  )}
                />
              </span>
              <span className="flex items-end">
                <ButtonComponent
                  type="button"
                  style="secondary"
                  onClick={() => setActiveModal("customer")}
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
                      options={garmentsOptions}
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
                  onClick={() => setActiveModal("garment")}
                >
                  Nueva prenda
                </ButtonComponent>
              </span>
            </div>

            {/* Entrega */}
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
                      options={deliveriesOptions}
                      value={field.value ?? ""}
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
                  onClick={() => setActiveModal("delivery")}
                >
                  Nuevo tipo de entrega
                </ButtonComponent>
              </span>
            </div>

            {/* Estado de pago */}
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
                {...register("price", { valueAsNumber: true })}
                error={errors.price?.message}
              />
            </div>
            <div>
              <InputComponent
                label="Observaciones(Opcional)"
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

      {activeModal && (
        <Modal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          title={
            activeModal === "customer"
              ? "Registra un nuevo cliente"
              : activeModal === "delivery"
                ? "Registra un nuevo tipo de entrega"
                : "Registra una nueva prenda o fardo"
          }
        >
          <>
            {activeModal === "customer" ? (
              <CustomerForm onSuccess={handleCustomerCreated} />
            ) : activeModal === "delivery" ? (
              <div>Form de tipo de entrega</div>
            ) : (
              <div>Form de Prenda individual o de Fardo</div>
            )}
          </>
        </Modal>
      )}
    </div>
  );
};

export default OrdersForm;
