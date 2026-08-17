import { withRole } from "@/lib/with-role";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRole<{ id: string }>(
  ["admin", "salesperson"],
  async (req: NextRequest, session, context) => {
    const { id } = await context.params;

    return NextResponse.json({
      message: `Cliente ${id} obtenido correctamente`,
      user: session.user,
    });
  },
);
