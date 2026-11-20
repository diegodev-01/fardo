import { describe, expect, it } from "vitest";
import { compareItemCodes, LABEL_PRESETS, pageCss } from "./labels";

describe("labels", () => {
  it("sorts item codes naturally", () => {
    expect(["A10", "A2", "B1", "A1", "AA1"].sort(compareItemCodes)).toEqual(["A1", "A2", "A10", "B1", "AA1"]);
    expect(["12", "3"].sort(compareItemCodes)).toEqual(["3", "12"]);
  });
  it("builds page css", () => {
    expect(pageCss(LABEL_PRESETS["thermal-50x30"])).toBe("@page { size: 50mm 30mm; margin: 0mm; }");
  });
});
