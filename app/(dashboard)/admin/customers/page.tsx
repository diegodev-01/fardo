"use client";
import { CardComponent } from "@/components/common/card-component";
import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import { ICustomer } from "@/lib/models/customer.model";
import { Customer, customerSchema } from "@/lib/schemas/customer";
import {
  createCustomer,
  getCustomerById,
  getCustomers,
} from "@/lib/services/customer.service";
import { formatDate } from "@/lib/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

const CustomerRegisterForm = () => {
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
        department: "",
        address: "",
        city: "",
      },
      email: "",
    },
  });

  const selectedDepartment = watch("address.department");

  const handleFormSubmit = (data: Customer) => {
    createCustomer(data);
    console.log("Form submitted with data:", data);
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
                Departamento
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
                {(BOLIVIA_DEPARTAMENTOS[selectedDepartment] ?? []).map(
                  (city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ),
                )}
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

type CopyableEmailProps = {
  email?: string;
};

const CopyableEmail = ({ email }: CopyableEmailProps) => {
  const [copied, setCopied] = useState(false);

  if (!email) return <span>N/A</span>;

  const parts = email.split("@");
  const username = parts[0];
  const domain = parts[1];

  const truncatedEmail =
    username && domain && username.length > 5
      ? `${username.slice(0, 5)}...@${domain}`
      : email;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs">
      <span title={email}>{truncatedEmail}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-text/60 hover:text-text"
        title="Copiar email"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </span>
  );
};

type CustomerListItemProps = {
  customer: ICustomer;
  isSelected: boolean;
  onSelect: () => void;
};

const CustomerListItem = ({
  customer,
  isSelected,
  onSelect,
}: CustomerListItemProps) => {
  return (
    <li className="cursor-pointer" onClick={onSelect}>
      <CardComponent isSelected={isSelected}>
        <h3 className="font-mono text-sm">
          {customer.name} {customer.lastname}
        </h3>
        <p className="font-mono text-xs text-text/70">{customer.phone}</p>
        <div className="flex flex-wrap justify-between items-center gap-y-1 mt-2">
          <span className="font-mono text-sm">
            <h5 className="text-[10px] font-medium text-text/50">Ubicación:</h5>
            {customer.address?.department && `${customer.address.department}, `}
            {customer.address?.city}
          </span>
          <span className="font-mono text-sm">
            <h5 className="text-[10px] font-medium text-text/50">Creacion:</h5>
            {formatDate(customer.createdAt)}
          </span>
          <span className="font-mono text-sm">
            <h5 className="text-[10px] font-medium text-text/50">Email:</h5>
            <CopyableEmail email={customer.email} />
          </span>
        </div>
      </CardComponent>
    </li>
  );
};

type CustomerData = {
  quantity: number;
  customers: ICustomer[];
};

const CustomersPage = () => {
  const [showListMobile, setShowListMobile] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ICustomer | null>(null);
  const [data, setData] = useState({
    quantity: 0,
    customers: [],
  } as CustomerData);
  const [activeTab, setActiveTab] = useState<"register" | "order" | "none">(
    "none",
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    getCustomers()
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

  const handleSelectCard = (card: ICustomer) => {
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
            Clientes
          </h3>
          <div className="flex gap-2 sm:mr-0 mr-10">
            <ButtonComponent onClick={handleStartRegister}>
              + Nuevo
            </ButtonComponent>
          </div>
        </div>
        <div className="flex justify-around items-center p-4 border-t border-b border-border shrink-0">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="w-4 h-4 text-green-500 font-bold" />
            Registrados
          </p>
          <p className="font-mono text-xs text-text/70">{data.quantity}</p>
        </div>
        <ul className="p-4 space-y-2 overflow-y-auto flex-1">
          {data.customers.map((card, index) => (
            <CustomerListItem
              key={`customer-${card._id || card._id || index}`}
              customer={card}
              isSelected={selectedCard?._id === card._id}
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
              Registrar cliente
            </h2>
            <p className="text-xs text-text/70 font-mono mt-1">
              Ingresa la información del ciente para registrarlo en el sistema
            </p>
          </div>
        </div>
        {activeTab === "register" ? (
          <CustomerRegisterForm />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 m-auto mt-60 text-center">
            <h2 className="text-lg font-semibold text-text/50">
              Seleccionar cliente
            </h2>
            {selectedCard ? (
              <div className="mt-4">
                <span className="flex flex-col gap-1 text-sm text-text/70">
                  <p>Nombre del cliente: {selectedCard.name}</p>
                  <p>Apellido del cliente: {selectedCard.lastname}</p>
                </span>
                <p>Telefono: {selectedCard.phone}</p>
              </div>
            ) : (
              <p className="mt-4 text-text/30 ">
                Selecciona un cliente para ver los detalles.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
