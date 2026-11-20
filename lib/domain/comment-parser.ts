export interface ParsedClaim {
  /** Canonical item code: "A1" (bale item) or "12" (loose unit). */
  code: string;
}

/** lowercase, strip accents, drop emoji/punctuation (keeps # and alphanumerics), collapse spaces. */
export function normalizeComment(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}#\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// keyword: "mio" or the common leetspeak "mi0"; then optional "#", optional bale letters, digits.
const CLAIM_RE = /^(?:mio|mi0)\s*#?\s*([a-z]{1,3})?\s*(\d{1,4})(?:\s|$)/;

/** Returns the claimed code, or null if the comment is not a claim. */
export function parseClaim(text: string): ParsedClaim | null {
  const m = CLAIM_RE.exec(normalizeComment(text));
  if (!m) return null;
  const n = Number(m[2]);
  if (n < 1) return null;
  return { code: `${(m[1] ?? "").toUpperCase()}${n}` };
}
