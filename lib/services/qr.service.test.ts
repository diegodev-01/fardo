import { describe, expect, it } from "vitest";
import { isValidQrCode, qrPng, qrSvg } from "./qr.service";

describe("qr.service", () => {
  it("accepts only app-generated codes", () => {
    for (const ok of ["A", "AB", "A1", "AA10", "12"]) expect(isValidQrCode(ok)).toBe(true);
    for (const bad of ["", "a-1", "http://x", "A1 ", "0", "1A"]) expect(isValidQrCode(bad)).toBe(false);
  });
  it("renders SVG and PNG", async () => {
    expect(await qrSvg("A1")).toMatch(/^<\?xml|^<svg/);
    const png = await qrPng("A1", 128);
    expect([...png.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });
});
