export type LabelPresetId = "a4-3x8" | "thermal-50x30";

export interface LabelPreset {
  id: LabelPresetId;
  name: string;
  /** physical label size */
  widthMm: number;
  heightMm: number;
  columns: number;
  /** CSS @page size and margin */
  page: { size: string; marginMm: number };
}

export const LABEL_PRESETS: Record<LabelPresetId, LabelPreset> = {
  // 24 labels per A4 sheet (3 x 8); 63.5 x 33.9 mm like common adhesive sheets
  "a4-3x8": {
    id: "a4-3x8",
    name: "Hoja A4 (24 etiquetas)",
    widthMm: 63.5,
    heightMm: 33.9,
    columns: 3,
    page: { size: "A4", marginMm: 10 },
  },
  // roll printer: one label per page
  "thermal-50x30": {
    id: "thermal-50x30",
    name: "Térmica 50×30 mm",
    widthMm: 50,
    heightMm: 30,
    columns: 1,
    page: { size: "50mm 30mm", marginMm: 0 },
  },
};

export function pageCss(p: LabelPreset): string {
  return `@page { size: ${p.page.size}; margin: ${p.page.marginMm}mm; }`;
}

/** Natural order for item codes: A2 before A10, letters before loose numbers. */
export function compareItemCodes(a: string, b: string): number {
  const pa = /^([A-Z]*)(\d+)$/.exec(a);
  const pb = /^([A-Z]*)(\d+)$/.exec(b);
  if (!pa || !pb) return a.localeCompare(b);
  return pa[1].length - pb[1].length || pa[1].localeCompare(pb[1]) || Number(pa[2]) - Number(pb[2]);
}
