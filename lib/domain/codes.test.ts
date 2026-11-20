import { describe, expect, it } from "vitest";
import { baleCodeFromIndex, baleIndexFromCode, formatLooseCode, compareBaleCodes, formatItemCode, nextBaleCode, parseItemCode } from "./codes";

describe("nextBaleCode", () => {
  it.each([[undefined, "A"], ["A", "B"], ["Z", "AA"], ["AZ", "BA"], ["ZZ", "AAA"], ["b", "C"]])(
    "%s -> %s", (p, e) => expect(nextBaleCode(p as string | undefined)).toBe(e));
  it("rejects digits", () => expect(() => nextBaleCode("A9")).toThrow());
});
describe("item codes", () => {
  it("formats and parses", () => {
    expect(formatItemCode("A", 10)).toBe("A10");
    expect(parseItemCode("aa12")).toEqual({ baleCode: "AA", n: 12 });
    expect(parseItemCode("A0")).toBeNull();
    expect(parseItemCode("12")).toEqual({ baleCode: null, n: 12 });
    expect(parseItemCode("A-1")).toBeNull();
    expect(formatLooseCode(7)).toBe("7");
  });
  it("sorts bale codes", () => expect(["AA", "B", "A"].sort(compareBaleCodes)).toEqual(["A", "B", "AA"]));
});
describe("bale index mapping", () => {
  it.each([[1, "A"], [26, "Z"], [27, "AA"], [52, "AZ"], [53, "BA"], [703, "AAA"]])("%i <-> %s", (n, c) => {
    expect(baleCodeFromIndex(n)).toBe(c);
    expect(baleIndexFromCode(c)).toBe(n);
  });
  it("agrees with nextBaleCode", () => {
    let c = "A";
    for (let i = 2; i < 800; i++) { c = nextBaleCode(c); expect(c).toBe(baleCodeFromIndex(i)); }
  });
});
