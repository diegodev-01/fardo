import { auth } from "@/lib/auth";
import { type Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export type Roles = "admin" | "salesperson" | "customer";

export type RouteContext<T = Record<string, string>> = {
  params: Promise<T>;
};

type HandlerWithSession<T = Record<string, string>> = (
  req: NextRequest,
  session: Session,
  context: RouteContext<T>,
) => Promise<NextResponse>;

export function withRole<T = Record<string, string>>(
  roles: Roles[],
  handler: HandlerWithSession<T>,
) {
  return async (req: NextRequest, context: RouteContext<T>) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userRole = session.user.role || "";
      if (!roles.includes(userRole as Roles)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return await handler(req, session, context);
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error", details: (error as Error).message },
        { status: 500 },
      );
    }
  };
}
