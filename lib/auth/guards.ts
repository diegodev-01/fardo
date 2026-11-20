import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import type { Roles } from "@/lib/with-role";

export type GuardResult =
  | { ok: true; session: Session; userId: string; role: Roles }
  | { ok: false; error: string };

/**
 * Authorization check for server actions (which are public POST endpoints
 * and are NOT covered by proxy.ts). Returns a result instead of throwing so
 * actions can return `{ success: false, error }`.
 */
export async function guard(roles: Roles[]): Promise<GuardResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "No autenticado" };
  const role = (session.user.role || "") as Roles;
  if (!roles.includes(role)) return { ok: false, error: "No autorizado" };
  return { ok: true, session, userId: session.user.id, role };
}

/** Mongo filter limiting non-admins to documents they own. */
export function ownerFilter(g: Extract<GuardResult, { ok: true }>) {
  return g.role === "admin" ? {} : { salesperson: g.userId };
}
