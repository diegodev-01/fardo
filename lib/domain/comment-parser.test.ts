import { describe, expect, it } from "vitest";
import { normalizeComment, parseClaim } from "./comment-parser";

describe("parseClaim", () => {
  it.each([
    ["mío 1", "1"], ["mio A1", "A1"], ["mío #12", "12"], ["MÍO a10", "A10"], ["mi0 a1", "A1"],
    ["🔥 mío 5 🔥", "5"], ["  mio   b 3  ", "B3"], ["mío!!! #A2", "A2"], ["mio a1 por favor", "A1"], ["mío 007", "7"],
  ])("%s -> %s", (t, code) => expect(parseClaim(t)?.code).toBe(code));

  it.each(["hola", "mío", "mio a", "mio 0", "quiero mio 5", "mío un", "amio 3", "mio 12345", "mio abcd1"])(
    "rejects %s", (t) => expect(parseClaim(t)).toBeNull());

  it("normalizes", () => expect(normalizeComment("  MÍO   ñandú 😀 #3 ")).toBe("mio nandu #3"));
});
