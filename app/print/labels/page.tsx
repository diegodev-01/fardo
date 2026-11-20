import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { compareItemCodes } from "@/lib/domain/labels";
import baleModel from "@/lib/models/bale.model";
import garmentModel from "@/lib/models/garment.model";
import { qrSvg } from "@/lib/services/qr.service";
import LabelSheet, { type LabelData } from "./label-sheet";

export const dynamic = "force-dynamic";

/**
 * /print/labels?bale=A  -> labels for every garment of bale A (+ the bale label)
 * /print/labels?loose=1 -> labels for garments that do not come from a bale
 * Lives outside the dashboard layout so the sidebar never prints.
 */
export default async function PrintLabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ bale?: string; loose?: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "admin" && role !== "salesperson")) redirect("/login");

  const { bale: baleCode, loose } = await searchParams;
  await connectDB();

  const owner = role === "admin" ? {} : { salesperson: session.user.id };
  let title = "Etiquetas";
  let baleId: string | undefined;
  let garments: { _id: unknown; code?: string; name: string; price: number; size?: string }[] = [];
  const labels: LabelData[] = [];

  if (baleCode) {
    const bale = await baleModel
      .findOne({ code: baleCode.toUpperCase(), deletedAt: null, ...owner })
      .select("code name")
      .lean<{ _id: unknown; code: string; name: string }>();
    if (!bale) return <p className="p-6">Fardo no encontrado.</p>;
    baleId = String(bale._id);
    title = `Fardo ${bale.code} — ${bale.name}`;
    labels.push({ code: bale.code, name: bale.name, svg: await qrSvg(bale.code) });
    garments = await garmentModel
      .find({ BaleId: baleId, deletedAt: null })
      .select("code name price size")
      .lean();
  } else if (loose) {
    title = "Prendas individuales";
    garments = await garmentModel
      .find({
        $or: [{ BaleId: { $exists: false } }, { BaleId: null }, { BaleId: "" }],
        deletedAt: null,
        ...owner,
      })
      .select("code name price size")
      .lean();
  } else {
    return <p className="p-6">Indica ?bale=CÓDIGO o ?loose=1</p>;
  }

  const coded = garments
    .filter((g): g is typeof g & { code: string } => !!g.code)
    .sort((a, b) => compareItemCodes(a.code, b.code));
  for (const g of coded) {
    labels.push({ code: g.code, name: g.name, price: g.price, size: g.size, svg: await qrSvg(g.code) });
  }

  return (
    <LabelSheet
      title={title}
      labels={labels}
      missing={garments.length - coded.length}
      baleId={baleId}
      canBackfill={role === "admin"}
    />
  );
}
