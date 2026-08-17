"use client";
import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import { ISale } from "@/lib/models/sale.model";
import { saleSchema, SaleSchemaType } from "@/lib/schemas/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { Radio } from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";

type CustomerListItemProps = {
  customerId: string;
  isSelected: boolean;
  onSelect: () => void;
};

const CustomerListItem = ({
  customerId,
  isSelected,
  onSelect,
}: CustomerListItemProps) => {
  return (
    <li>
      <button
        className={`p-2 rounded-md ${
          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
        onClick={onSelect}
      >
        {customerId}
      </button>
    </li>
  );
};

const OrdersRegisterForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const customers = ["customer1", "customer2", "customer3"];
  const garments = ["garment1", "garment2", "garment3"];
  const deliverys = ["delivery1", "delivery2", "delivery3"];
  const paymentStates = ["PENDIENTE", "PAGADO"];

  const handleFormSubmit = (data: SaleSchemaType) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="p-4">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 font-mono"
        >
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="customer"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Cliente
              </label>
              <span className="flex gap-2">
                <select
                  id="customer"
                  {...register("customerId")}
                  className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecciona un cliente</option>
                  {customers.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerId.message}
                  </p>
                )}
                <ButtonComponent
                  type="button"
                  style="secondary"
                  onClick={() => router.push("/admin/customers")}
                >
                  Nuevo cliente
                </ButtonComponent>
              </span>
            </div>
            <div>
              <label
                htmlFor="garment"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Prenda
              </label>
              <span className="flex gap-2">
                <select
                  id="garment"
                  {...register("garmentId")}
                  className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecciona una prenda</option>
                  {garments.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
                {errors.garmentId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.garmentId.message}
                  </p>
                )}
                <ButtonComponent
                  type="button"
                  style="secondary"
                  onClick={() => router.push("/admin/garments")}
                >
                  Nueva prenda
                </ButtonComponent>
              </span>
            </div>
            <div>
              <label
                htmlFor="delivery"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Entrega
              </label>
              <span className="flex gap-2">
                <select
                  id="delivery"
                  {...register("deliveryId")}
                  className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecciona el tipo de entrega</option>
                  {deliverys.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
                {errors.deliveryId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.deliveryId.message}
                  </p>
                )}
                <ButtonComponent
                  type="button"
                  style="secondary"
                  onClick={() => router.push("/admin/deliverys")}
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
                  <option key={dep} value={dep}>
                    {dep}
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

type OrderData = {
  quantity: number;
  orders: { _id: string; type: string }[];
};

const OrdersPage = () => {
  const [showListMobile, setShowListMobile] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{
    _id: string;
    type: string;
  } | null>(null);
  const [data, setData] = useState({
    quantity: 0,
    orders: [],
  } as OrderData);
  const [activeTab, setActiveTab] = useState<"register" | "order" | "none">(
    "none",
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelectCard = (card: { _id: string; type: string }) => {
    setSelectedCard(card);
  };

  const handleStartRegister = () => {
    setShowListMobile(false);
    setSelectedCard(null);
    setActiveTab("register");
    const params = new URLSearchParams(searchParams);
    params.set("type", "order");
    params.set("action", "register");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <aside
        className={`${
          showListMobile ? "flex" : "hidden"
        } md:flex w-full md:w-80 border-r border-border flex-col shrink-0 h-full`}
      >
        <div className="flex justify-between items-center p-4 shrink-0 gap-2">
          <h3 className="text-base sm:text-lg font-semibold truncate">
            Prendas y fardos
          </h3>
          <div className="flex gap-2 sm:mr-0 mr-10">
            <ButtonComponent onClick={handleStartRegister}>
              + Nueva
            </ButtonComponent>
          </div>
        </div>
        <div className="flex justify-around items-center p-4 border-t border-b border-border shrink-0">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Radio className="w-4 h-4 animate-pulse text-red-500" />
            Live ahora
          </p>
          <p className="font-mono text-xs text-text/70">
            {data.quantity} pedidos
          </p>
        </div>
        <ul className="p-4 space-y-2 overflow-y-auto flex-1">
          {data.orders.map((card, index) => (
            <CustomerListItem
              key={`bale-${card._id || index}`}
              customerId={card._id}
              isSelected={
                selectedCard?._id === card._id &&
                selectedCard?.type === card.type
              }
              onSelect={() => handleSelectCard(card)}
            />
          ))}
        </ul>
      </aside>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 sm:p-6 pb-4 border-b border-border shrink-0 bg-background">
          <button
            type="button"
            // onClick={handleBackToListMobile}
            className="md:hidden shrink-0 mt-0.5 text-xs font-mono text-text/60 hover:text-text px-2 py-1 border border-border rounded-md"
          >
            ← Volver
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">
              Registrar venta
            </h2>
            <p className="text-xs text-text/70 font-mono mt-1">
              Ingresa la información inicial para el inventario
            </p>
          </div>
        </div>
        {activeTab === "register" ? (
          <OrdersRegisterForm />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Detalles del pedido</h2>
            {selectedCard ? (
              <div className="mt-4">
                <p>ID del pedido: {selectedCard._id}</p>
                <p>Tipo: {selectedCard.type}</p>
              </div>
            ) : (
              <p className="mt-4 text-muted-foreground">
                Selecciona un pedido para ver los detalles.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
