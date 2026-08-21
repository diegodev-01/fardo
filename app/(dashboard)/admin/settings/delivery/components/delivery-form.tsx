"use client";

import { useState } from "react";
import { InputComponent } from "@/components/ui/form/input-component";
import { ButtonComponent } from "@/components/ui/button-component";
import { createDeliveryAction } from "@/lib/actions/delivery.action";
import { deliverySchema, DeliverySchemaType } from "@/lib/schemas/delivery";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function DeliveryForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DeliverySchemaType>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      name: "",
      phone: "",
      deliveryMethod: undefined,
      address: "",
    },
  });

  const handleFormSubmit = async (data: DeliverySchemaType) => {
    setLoading(true);
    setError(null);

    const res = await createDeliveryAction(data);

    if (res.success) {
      router.refresh();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Ocurrió un error al crear el método de entrega");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="max-w-xl mx-auto flex flex-col gap-5"
    >
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}

      <InputComponent
        label="Nombre del destinatario o responsable"
        placeholder="Ej: Juan Pérez / Casillero XYZ"
        {...register("name")}
        error={errors.name?.message}
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="deliveryMethod"
          className="block text-xs font-medium text-text/70 mb-1"
        >
          Tipo de Entrega
        </label>
        <select
          id="deliveryMethod"
          {...register("deliveryMethod")}
          className="w-full text-sm bg-background border border-border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Selecciona un tipo...</option>
          <option value="casillero">Casillero</option>
          <option value="punto fijo">Punto Fijo (en la ciudad)</option>
          <option value="envio">Envío (a otros departamentos)</option>
        </select>
        {errors.deliveryMethod && (
          <p className="text-red-500 text-xs mt-1">
            {errors.deliveryMethod.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-xs font-medium text-text/70 mb-1"
        >
          Numero de telefono (Opcional)
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
          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="address"
          className="block text-xs font-medium text-text/70 mb-1"
        >
          Dirección (Opcional)
        </label>
        <textarea
          id="address"
          rows={3}
          {...register("address")}
          className="w-full text-sm bg-background border border-border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          placeholder="Dirección detallada, referencias, etc."
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <ButtonComponent type="submit" style="primary">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
            </span>
          ) : (
            "Guardar Método de Entrega"
          )}
        </ButtonComponent>
      </div>
    </form>
  );
}
