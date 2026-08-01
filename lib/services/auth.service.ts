"use server";

import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/user.model";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export type AuthActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = (formData.get("name") || formData.get("nombre")) as string;
  const role =
    formData.get("role") || (formData.get("rol") as string) || "customer";

  if (!email || !password) {
    return { error: "El correo y la contraseña son obligatorios" };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  try {
    await connectDB();

    const existingUser = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return { error: "Este correo electrónico ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name,
      role,
    });

    // 5. Iniciar sesión automáticamente tras el registro
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error: unknown) {
    const err = error as { type?: string; message?: string };

    if (
      err.type === "NavigationRedirect" ||
      err.message?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Error en signup:", error);
    return { error: "Error al registrar la cuenta. Intenta de nuevo." };
  }
}

/**
 * Autentica a un usuario existente mediante NextAuth Credentials.
 */
export async function login(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor ingresa tu correo y contraseña" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Correo o contraseña incorrectos" };
        default:
          return { error: "Error de autenticación" };
      }
    }

    const err = error as { type?: string; message?: string };

    if (
      err.type === "NavigationRedirect" ||
      err.message?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return { error: "Ocurrió un error inesperado al iniciar sesión" };
  }
}
