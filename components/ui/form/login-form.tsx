"use client";

import { useActionState } from "react";
import { login } from "@/lib/services/auth.service";
import { InputComponent } from "./input-component";

export function LoginForm() {
  type LoginState = { error: string } | null;

  // useActionState recibe la Server Action y el estado inicial
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (_state, formData) => (await login(formData)) as unknown as LoginState,
    null,
  );

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

      {state && (
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
