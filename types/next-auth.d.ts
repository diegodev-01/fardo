import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extiende la interfaz `User` que retorna `authorize()`
   */
  interface User {
    id?: string;
    role?: string;
  }

  /**
   * Extiende el objeto `session.user`
   */
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extiende el objeto `token` en el callback `jwt`
   */
  interface JWT {
    id?: string;
    role?: string;
  }
}