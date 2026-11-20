"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignMissingCodesAction } from "@/lib/actions/garment.actions";
import { LABEL_PRESETS, pageCss, type LabelPresetId } from "@/lib/domain/labels";

export interface LabelData {
  code: string;
  name: string;
  price?: number;
  size?: string;
  /** server-rendered inline SVG */
  svg: string;
}

export default function LabelSheet({
  title,
  labels,
  missing,
  baleId,
  canBackfill,
}: {
  title: string;
  labels: LabelData[];
  missing: number;
  baleId?: string;
  canBackfill: boolean;
}) {
  const router = useRouter();
  const [presetId, setPresetId] = useState<LabelPresetId>("a4-3x8");
  const [showPrice, setShowPrice] = useState(true);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const preset = LABEL_PRESETS[presetId];

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{pageCss(preset)}</style>

      <div className="print:hidden border-b border-neutral-300 p-4 flex flex-wrap items-center gap-3">
        <h1 className="font-semibold mr-auto">{title}</h1>
        <label className="text-sm flex items-center gap-2">
          Formato
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as LabelPresetId)}
            className="border border-neutral-400 rounded px-2 py-1 bg-white"
          >
            {Object.values(LABEL_PRESETS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} />
          Precio
        </label>
        <button
          onClick={() => window.print()}
          disabled={labels.length === 0}
          className="px-4 py-1.5 rounded bg-black text-white text-sm disabled:opacity-50"
        >
          Imprimir ({labels.length})
        </button>
        {missing > 0 && (
          <p className="w-full text-sm text-amber-700">
            {missing} prenda(s) sin código no aparecen.{" "}
            {canBackfill && (
              <button
                className="underline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const r = await assignMissingCodesAction(baleId);
                    if (!r.success) setError(r.error);
                    else router.refresh();
                  })
                }
              >
                Generar códigos
              </button>
            )}
          </p>
        )}
        {error && <p className="w-full text-sm text-red-700">{error}</p>}
      </div>

      {labels.length === 0 ? (
        <p className="p-6 text-sm">No hay etiquetas para imprimir.</p>
      ) : (
        <div
          className="grid p-4 print:p-0"
          style={{ gridTemplateColumns: `repeat(${preset.columns}, ${preset.widthMm}mm)` }}
        >
          {labels.map((l) => (
            <div
              key={l.code}
              className="flex items-center gap-1.5 overflow-hidden border border-dashed border-neutral-300 print:border-0 p-1.5"
              style={{
                width: `${preset.widthMm}mm`,
                height: `${preset.heightMm}mm`,
                breakInside: "avoid",
                pageBreakAfter: preset.columns === 1 ? "always" : "auto",
              }}
            >
              <div
                className="shrink-0 [&>svg]:w-full [&>svg]:h-full"
                style={{ width: `${preset.heightMm - 4}mm`, height: `${preset.heightMm - 4}mm` }}
                dangerouslySetInnerHTML={{ __html: l.svg }}
              />
              <div className="min-w-0 flex flex-col leading-tight">
                <span className="font-mono font-extrabold text-2xl">{l.code}</span>
                <span className="text-[9px] truncate">{l.name}</span>
                {l.size && <span className="text-[9px]">Talla {l.size}</span>}
                {showPrice && l.price !== undefined && (
                  <span className="text-[11px] font-semibold">{l.price}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
