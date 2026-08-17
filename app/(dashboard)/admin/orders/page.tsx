"use client";
import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import {
  SearchableSelect,
  SelectOption,
} from "@/components/ui/form/searchable-select";
import { Modal } from "@/components/ui/modal";
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
import { Controller, useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import OrdersForm from "./components/orders-form";

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

const OrdersRegisterForm = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<SelectOption[]>(INITIAL_CUSTOMERS);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

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

  // Manejar creación rápida de nuevo cliente
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

  return (
    <div className="p-4">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <OrdersForm />
        <Modal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          title="Registrar Nuevo Cliente"
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">
                Nombre Completo / Teléfono
              </label>
              <input
                type="text"
                required
                className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Ej: Juan Pérez - 76543210"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-accent"
              >
                Cancelar
              </button>
              <ButtonComponent type="submit">
                Guardar y Seleccionar
              </ButtonComponent>
            </div>
          </form>
        </Modal>
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
