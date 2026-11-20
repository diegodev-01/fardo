import QRCode from "qrcode";
import { isBaleCode, parseItemCode } from "@/lib/domain/codes";

/** Only codes the app generates may be encoded (bale "A" or item "A1" / "12"). */
export function isValidQrCode(code: string): boolean {
  // exact match: no surrounding whitespace or lowercase variants
  return isBaleCode(code) || (parseItemCode(code) !== null && /^[A-Z]*\d+$/.test(code));
}

const OPTS = { errorCorrectionLevel: "M" as const, margin: 1 };

export function qrSvg(code: string): Promise<string> {
  return QRCode.toString(code, { ...OPTS, type: "svg" });
}

export function qrPng(code: string, width = 512): Promise<Buffer> {
  return QRCode.toBuffer(code, { ...OPTS, type: "png", width });
}
