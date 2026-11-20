import { NextResponse } from "next/server";
import { withRole } from "@/lib/with-role";
import { isValidQrCode, qrPng, qrSvg } from "@/lib/services/qr.service";

/** GET /api/qr/A1?format=svg|png&download=1 */
export const GET = withRole<{ code: string }>(
  ["admin", "salesperson"],
  async (req, _session, { params }) => {
    const code = (await params).code.toUpperCase();
    if (!isValidQrCode(code)) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }

    const url = new URL(req.url);
    const png = url.searchParams.get("format") === "png";
    const headers: Record<string, string> = { "Cache-Control": "private, max-age=3600" };
    if (url.searchParams.get("download")) {
      headers["Content-Disposition"] = `attachment; filename="qr-${code}.${png ? "png" : "svg"}"`;
    }

    if (png) {
      const buf = await qrPng(code);
      return new NextResponse(new Uint8Array(buf), {
        headers: { ...headers, "Content-Type": "image/png" },
      });
    }
    return new NextResponse(await qrSvg(code), {
      headers: { ...headers, "Content-Type": "image/svg+xml" },
    });
  },
);
