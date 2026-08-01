// lib/with-role.ts
import { auth } from "@/lib/auth";
import { type Session } from "next-auth";
import { NextResponse } from "next/server";

type HandlerWithSession = (
  req: Request,
  session: Session,
) => Promise<NextResponse>;

type Roles = "admin" | "salesperson" | "customer";

export function withRole(roles: Roles[], handler: HandlerWithSession) {
  return async (req: Request) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userRole = session.user.role || "";
      if (!roles.includes(userRole as Roles)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return await handler(req, session);
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error", details: (error as Error).message },
        { status: 500 },
      );
    }
  };
}
