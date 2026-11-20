/** Pure, dependency-free code helpers. Bale codes: A..Z, AA..ZZ. Item codes: <bale><n> (A1, A10). */

const BALE_RE = /^[A-Z]+$/;
const ITEM_RE = /^([A-Z]+)(\d+)$/;

export function isBaleCode(code: string): boolean {
  return BALE_RE.test(code);
}

/** A -> B, Z -> AA, AZ -> BA, ZZ -> AAA. Throws on invalid input. */
export function nextBaleCode(prev?: string | null): string {
  if (!prev) return "A";
  const code = prev.trim().toUpperCase();
  if (!BALE_RE.test(code)) throw new Error(`Invalid bale code: ${prev}`);
  const chars = code.split("");
  for (let i = chars.length - 1; i >= 0; i--) {
    if (chars[i] === "Z") {
      chars[i] = "A";
    } else {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      return chars.join("");
    }
  }
  return "A" + chars.join("");
}

/** Orders bale codes by length then alphabetically (A < Z < AA). */
export function compareBaleCodes(a: string, b: string): number {
  return a.length - b.length || (a < b ? -1 : a > b ? 1 : 0);
}

/** 1 -> A, 26 -> Z, 27 -> AA (bijective base 26). */
export function baleCodeFromIndex(n: number): string {
  if (!Number.isInteger(n) || n < 1) throw new Error(`Invalid index: ${n}`);
  let out = "";
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}

export function baleIndexFromCode(code: string): number {
  if (!BALE_RE.test(code)) throw new Error(`Invalid bale code: ${code}`);
  return [...code].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
}

export function formatItemCode(baleCode: string, n: number): string {
  if (!BALE_RE.test(baleCode)) throw new Error(`Invalid bale code: ${baleCode}`);
  if (!Number.isInteger(n) || n < 1) throw new Error(`Invalid sequence: ${n}`);
  return `${baleCode}${n}`;
}

/** Loose units (not from a bale) use a plain number: "mío 12". */
export function formatLooseCode(n: number): string {
  if (!Number.isInteger(n) || n < 1) throw new Error(`Invalid sequence: ${n}`);
  return String(n);
}

/** "A10" -> {A,10}; "12" -> {null,12} (loose unit). */
export function parseItemCode(code: string): { baleCode: string | null; n: number } | null {
  const c = code.trim().toUpperCase();
  const m = ITEM_RE.exec(c);
  if (m) {
    const n = Number(m[2]);
    return n >= 1 ? { baleCode: m[1], n } : null;
  }
  if (/^\d+$/.test(c) && Number(c) >= 1) return { baleCode: null, n: Number(c) };
  return null;
}
