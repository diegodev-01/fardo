"use client";

import { useActionState } from "react";
import { login } from "@/lib/services/auth.service";
import { InputComponent } from "./input-component";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <InputComponent
        label="Email"
        name="email"
        placeholder="Email"
        type="email"
        required
      />
      <InputComponent
        label="Contraseña"
        name="password"
        placeholder="Contraseña"
        type="password"
        required
      />

      {state?.error && (
        <p className="text-xs text-red-500 font-medium">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPending ? "Ingresando..." : "Iniciar Sesión"}
      </button>
    </form>
  );
}
