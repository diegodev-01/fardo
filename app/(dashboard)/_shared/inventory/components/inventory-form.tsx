"use client";

import { ButtonComponent } from "@/components/ui/button-component";
import { InputComponent } from "@/components/ui/form/input-component";
import { formSchema, InventoryFormData } from "@/lib/schemas/bale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useInventory } from "../inventory-context";
import { gradeOptions, sizeOptions } from "../lib/types";
import { updateBaleAction } from "@/lib/actions/bale.action";
import {
  SearchableSelect,
  SelectOption,
} from "@/components/ui/form/searchable-select";
import { useState } from "react";
import {
  AdminSummary,
  getAdminsAction,
  getSalespersonsAction,
} from "@/lib/actions/user.actions";

// Dato existente que se pasa cuando el formulario se usa para editar.
interface RawPieceType {
  type: string;
  quantity: number;
  MinPiecePrice: number;
  MaxPiecePrice?: number;
  category: string;
}

export interface InventoryEditData {
  _id: string;
  type: "bale" | "garment";
  name: string;
  description?: string;
  price: number;
  weight?: number;
  sendPrice?: number;
  totalQuantity?: number;
  currentPieces?: number;
  income?: number;
  state?: "DISPONIBLE" | "DEFECTUOSO" | "RESERVADO" | "VENDIDO";
  quantity?: number;
  baleId?: string;
  size?: string;
  garmentType?: string;
  grade?: string;
  color?: string;
  salesPersonId?: string;
  pieceTypes?: RawPieceType[];
}

interface InventoryFormProps {
  data?: InventoryEditData;
  basePath: string;
  hideSalespersonField?: boolean;
}

type SalespersonSummary = {
  _id: string;
  name: string;
  phone?: string;
  role: string;
};

export function InventoryForm({
  data,
  basePath,
  hideSalespersonField = false,
}: InventoryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = Boolean(data);

  const activeType: "bale" | "garment" = isEditMode
    ? (data?.type as "bale" | "garment") || "bale"
    : (searchParams.get("type") as "bale" | "garment") || "bale";

  const { bales, pieceOptions, refresh, setShowListMobile } = useInventory();

  const [salespersonsOptions, setSalespersonsOptions] = useState<
    SelectOption[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        setIsLoading(true);
        const usersData = await getAdminsAction();
        if (usersData && Array.isArray(usersData.data)) {
          const mappedUsers: SelectOption[] = usersData.data
            .filter((u): u is AdminSummary & { _id: string } => Boolean(u._id))
            .map((u) => ({
              value: u._id,
              label: u.name,
              searchTerms: `${u.name} ${u.phone || ""}`,
            }));
          setSalespersonsOptions(mappedUsers);
        }
      } catch (error) {
        console.error("Error al cargar vendedores:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalespersons();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: activeType,
      name: "",
      description: "",
      price: "",
      state: "DISPONIBLE",
      quantity: 1,
      totalQuantity: undefined,
      baleId: "",
      weight: "",
      sendPrice: "",
      pieceTypes: [
        {
          type: "",
          quantity: 1,
          MinPiecePrice: "",
          MaxPiecePrice: "",
          category: "",
        },
      ],
      size: "",
      garmentType: "",
      grade: "",
      color: "",
      salesPersonId: "",
      ...mapDataToFormValues(data, activeType),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pieceTypes",
  });

  useEffect(() => {
    if (!isEditMode || !data) return;
    reset(mapDataToFormValues(data, activeType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEditMode]);

  useEffect(() => {
    if (isEditMode) return;
    reset({
      type: activeType,
      name: "",
      description: "",
      price: "",
      state: "DISPONIBLE",
      totalQuantity: undefined,
      quantity: 1,
      baleId: "",
      weight: "",
      sendPrice: "",
      pieceTypes: [],
      salesPersonId: "",
      size: "",
      garmentType: "",
      grade: "",
      color: "",
    });
  }, [activeType, reset, isEditMode]);

  function mapDataToFormValues(
    data: InventoryEditData | undefined,
    activeType: "bale" | "garment",
  ): Partial<InventoryFormData> {
    if (!data) return { type: activeType };

    return {
      type: data.type,
      name: data.name || "",
      description: data.description || "",
      price: data.price !== undefined ? String(data.price) : "",
      state: data.state,
      quantity: data.quantity || 1,
      totalQuantity: data.totalQuantity,
      baleId: data.baleId || "",
      weight: data.weight !== undefined ? String(data.weight) : "",
      sendPrice: data.sendPrice !== undefined ? String(data.sendPrice) : "",
      pieceTypes:
        data.pieceTypes?.map((p) => ({
          type: p.type,
          quantity: p.quantity,
          MinPiecePrice:
            p.MinPiecePrice !== undefined ? String(p.MinPiecePrice) : "",
          MaxPiecePrice:
            p.MaxPiecePrice !== undefined ? String(p.MaxPiecePrice) : "",
          category: p.category || "",
        })) || [],
      size: data.size || "",
      salesPersonId: data.salesPersonId || "",
      garmentType: data.garmentType || "",
      grade: data.grade || "",
      color: data.color || "",
    };
  }

  const watchPieceTypes = watch("pieceTypes") || [];
  const watchTotalQuantity = watch("totalQuantity") || 0;
  const watchBaleId = watch("baleId");

  const availableGarmentOptions =
    activeType === "garment" && watchBaleId
      ? pieceOptions.filter((opt) => {
          const selectedBale = bales.find((b) => b._id === watchBaleId);
          return selectedBale?.pieceTypes?.some((p) => p.type === opt.value);
        })
      : pieceOptions;

  const totalAllocated = watchPieceTypes.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0,
  );
  const targetTotal = Number(watchTotalQuantity) || 0;

  const handleSwitchType = (newType: "bale" | "garment") => {
    if (isEditMode) return;
    router.push(`${basePath}/register?type=${newType}`);
  };

  const handleAddPieceType = (selectedType: string) => {
    if (!selectedType) return;

    append({
      type: selectedType,
      quantity: 1,
      MinPiecePrice: "",
      MaxPiecePrice: "",
      category: "",
    });
  };

  const handleFormSubmit = async (formData: InventoryFormData) => {
    try {
      // Edición de FARDO -> usa el server action directamente
      if (isEditMode && activeType === "bale") {
        const result = await updateBaleAction(data!._id, {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price) || 0,
          weight: formData.weight ? Number(formData.weight) : undefined,
          sendPrice: Number(formData.sendPrice) || 0,
          totalQuantity: formData.totalQuantity,
          state: formData.state,
          pieceTypes: formData.pieceTypes?.map((p) => ({
            type: p.type,
            quantity: Number(p.quantity) || 0,
            MinPiecePrice: Number(p.MinPiecePrice) || 0,
            MaxPiecePrice: p.MaxPiecePrice
              ? Number(p.MaxPiecePrice)
              : undefined,
            category: p.category,
          })),
        });

        if (!result.success) {
          alert(result.error || "Ocurrió un error al actualizar");
          return;
        }

        await refresh();
        router.push(basePath);
        return;
      }

      const baseEndpoint =
        activeType === "garment"
          ? "/api/inventory/garments"
          : "/api/inventory/bales";

      const endpoint = isEditMode
        ? `${baseEndpoint}/${data!._id}`
        : baseEndpoint;
      const method = isEditMode ? "PUT" : "POST";

      const payload =
        activeType === "garment"
          ? {
              name: formData.name,
              description: formData.description,
              price: Number(formData.price) || 0,
              state: formData.state,
              quantity: Number(formData.quantity) || 1,
              baleId: formData.baleId || undefined,
              size: formData.size || undefined,
              garmentType: formData.garmentType || undefined,
              grade: formData.grade || undefined,
              color: formData.color || undefined,
              salesPersonId: formData.salesPersonId || undefined,
            }
          : formData;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(
          err.error ||
            `Ocurrió un error al ${isEditMode ? "actualizar" : "registrar"}`,
        );
        return;
      }

      await refresh();
      router.push(isEditMode ? basePath : `${basePath}/register?type=garment`);
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 sm:p-6 pb-4 border-b border-border shrink-0 bg-background">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => setShowListMobile(true)}
            className="md:hidden shrink-0 mt-0.5 text-xs font-mono text-text/60 hover:text-text px-2 py-1 border border-border rounded-md"
          >
            ← Volver
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">
              {isEditMode ? "Editar" : "Registrar"}{" "}
              {activeType === "garment" ? "Prenda Individual" : "Fardo"}
            </h2>
            <p className="text-xs text-text/70 font-mono mt-1">
              {isEditMode
                ? "Actualiza la información del inventario"
                : "Ingresa la información inicial para el inventario"}
            </p>
          </div>
        </div>

        {!isEditMode && (
          <div className="flex p-1 bg-border/30 rounded-lg gap-1 font-mono text-xs w-fit">
            <button
              type="button"
              onClick={() => handleSwitchType("bale")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeType === "bale"
                  ? "bg-background font-medium shadow-sm border border-border"
                  : "text-text/60 hover:text-text"
              }`}
            >
              Fardo
            </button>
            <button
              type="button"
              onClick={() => handleSwitchType("garment")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeType === "garment"
                  ? "bg-background font-medium shadow-sm border border-border"
                  : "text-text/60 hover:text-text"
              }`}
            >
              Prenda
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 font-mono"
        >
          <div>
            <InputComponent
              label="Título / Nombre"
              placeholder={
                activeType === "garment"
                  ? "Ej. Lote Prendas Verano"
                  : "Ej. Fardo Opción C"
              }
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-medium text-text/70 mb-1"
            >
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Descripción del contenido o detalles de ingreso..."
              {...register("description")}
              className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputComponent
                type="number"
                label="Precio ($)"
                placeholder="$0.00"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-xs font-medium text-text/70 mb-1"
              >
                Estado
              </label>
              <select
                id="state"
                {...register("state")}
                className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="DEFECTUOSO">Defectuoso</option>
                <option value="RESERVADO">Reservado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            {activeType === "bale" ? (
              <>
                <div>
                  <InputComponent
                    label="Número de piezas totales"
                    type="number"
                    placeholder="0"
                    {...register("totalQuantity")}
                  />
                  {errors.totalQuantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.totalQuantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <InputComponent
                    label="Peso(Kg)"
                    type="number"
                    placeholder="Peso en Kg"
                    {...register("weight")}
                    error={errors.weight?.message}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-3 p-3 bg-border/10 border border-border rounded-md">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <label className="block text-xs font-medium text-text/80">
                      Desglose por tipos de prenda
                    </label>
                    {targetTotal > 0 && (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full w-fit ${
                          totalAllocated === targetTotal
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : totalAllocated > targetTotal
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {totalAllocated} / {targetTotal} pcs
                      </span>
                    )}
                  </div>

                  <select
                    value=""
                    onChange={(e) => handleAddPieceType(e.target.value)}
                    className="w-full p-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option key="select-option" value="" disabled>
                      + Seleccionar tipo para agregar...
                    </option>
                    {pieceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {fields.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {fields.map((field, idx) => {
                        const optLabel =
                          pieceOptions.find((o) => o.value === field.type)
                            ?.label || field.type;
                        return (
                          <div
                            key={field.id}
                            className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-background p-2 border border-border rounded-md"
                          >
                            <span className="text-xs font-medium w-full sm:w-1/2 truncate">
                              {optLabel}
                            </span>
                            <InputComponent
                              type="number"
                              placeholder="Cantidad"
                              {...register(
                                `pieceTypes.${idx}.quantity` as const,
                              )}
                            />
                            <InputComponent
                              type="number"
                              placeholder="Precio min pieza"
                              {...register(
                                `pieceTypes.${idx}.MinPiecePrice` as const,
                              )}
                              error={
                                errors.pieceTypes?.[idx]?.MinPiecePrice?.message
                              }
                            />
                            <InputComponent
                              type="number"
                              placeholder="Precio max pieza"
                              {...register(
                                `pieceTypes.${idx}.MaxPiecePrice` as const,
                              )}
                              error={
                                errors.pieceTypes?.[idx]?.MaxPiecePrice?.message
                              }
                            />

                            <div className="flex flex-col gap-1 w-full sm:w-1/4">
                              <select
                                id={`category-${field.id}`}
                                className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                {...register(
                                  `pieceTypes.${idx}.category` as const,
                                )}
                              >
                                <option value="">
                                  Seleccionar Categoría...
                                </option>
                                {gradeOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="p-1 px-2 text-red-500 hover:bg-red-500/10 rounded text-xs transition-colors"
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(errors.pieceTypes?.root?.message ||
                    errors.pieceTypes?.message) && (
                    <p className="text-red-500 text-xs font-sans mt-1">
                      {errors.pieceTypes?.root?.message ||
                        errors.pieceTypes?.message}
                    </p>
                  )}
                </div>

                <div>
                  <InputComponent
                    label="Precio de envío"
                    type="number"
                    placeholder="0Bs"
                    {...register("sendPrice")}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <InputComponent
                    label="Cantidad"
                    type="number"
                    placeholder="1"
                    {...register("quantity")}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <span className="flex-1">
                  <label className="block text-xs font-medium text-text/70 mb-1">
                    Vendedor
                  </label>
                  <Controller
                    name="salesPersonId"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={salespersonsOptions}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder={
                          isLoading
                            ? "Cargando vendedores..."
                            : "Buscar o seleccionar vendedor..."
                        }
                        error={errors.salesPersonId?.message}
                      />
                    )}
                  />
                </span>

                <div>
                  <InputComponent
                    type="color"
                    label="Color"
                    placeholder="Color"
                    {...register("color")}
                  />
                  {errors.color && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.color.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="size"
                    className="block text-xs font-medium text-text/70 mb-1"
                  >
                    Talla
                  </label>
                  <select
                    id="size"
                    className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register("size")}
                  >
                    <option value="" disabled>
                      Selecciona una opción...
                    </option>
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="garmentType"
                    className="block text-xs font-medium text-text/70 mb-1"
                  >
                    Tipo de Prenda
                  </label>
                  <select
                    id="garmentType"
                    className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register("garmentType")}
                  >
                    <option value="" disabled>
                      {watchBaleId && availableGarmentOptions.length === 0
                        ? "El fardo no tiene tipos definidos"
                        : "Selecciona una opción..."}
                    </option>

                    {availableGarmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="grade"
                    className="block text-xs font-medium text-text/70 mb-1"
                  >
                    Grado
                  </label>
                  <select
                    id="grade"
                    className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    {...register("grade")}
                  >
                    <option value="" disabled>
                      Selecciona una opción...
                    </option>
                    {gradeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label
                    htmlFor="baleId"
                    className="block text-xs font-medium text-text/70 mb-1"
                  >
                    ¿Pertenece a un fardo? (Opcional)
                  </label>
                  <select
                    id="baleId"
                    {...register("baleId")}
                    className="w-full p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">No, es individual</option>
                    {bales.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.currentPieces}/{b.totalQuantity} piezas)
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border mt-6">
            <ButtonComponent type="submit">
              {isEditMode ? "Guardar Cambios" : "Guardar Registro"}
            </ButtonComponent>
            <button
              type="button"
              onClick={() => router.push(basePath)}
              className="px-4 py-2 text-xs text-danger/70 hover:text-text font-mono transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
