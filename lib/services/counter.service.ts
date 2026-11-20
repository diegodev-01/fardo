import baleModel from "@/lib/models/bale.model";
import garmentModel from "@/lib/models/garment.model";
import counterModel from "@/lib/models/counter.model";
import {
  baleCodeFromIndex,
  baleIndexFromCode,
  formatItemCode,
  formatLooseCode,
  isBaleCode,
} from "@/lib/domain/codes";

/** Atomically increments and returns the next value of a named counter. */
export async function nextSequence(key: string): Promise<number> {
  const doc = await counterModel.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return doc.seq;
}

/** Seeds the bale counter from existing codes once, so legacy bales are never reused. */
async function ensureBaleCounter() {
  if (await counterModel.exists({ _id: "bale" })) return;
  const bales: { code: string }[] = await baleModel.find().select("code").lean();
  const max = bales
    .map((b) => b.code)
    .filter(isBaleCode)
    .reduce((m, c) => Math.max(m, baleIndexFromCode(c)), 0);
  try {
    await counterModel.updateOne(
      { _id: "bale" },
      { $setOnInsert: { seq: max } },
      { upsert: true },
    );
  } catch (e) {
    if ((e as { code?: number }).code !== 11000) throw e; // concurrent seeding: fine
  }
}

export async function nextBaleCodeAtomic(): Promise<string> {
  await ensureBaleCounter();
  return baleCodeFromIndex(await nextSequence("bale"));
}

/** A1, A2, ... per bale. */
export async function nextItemCode(baleCode: string): Promise<string> {
  return formatItemCode(baleCode, await nextSequence(`item:${baleCode}`));
}

/** 1, 2, 3, ... for units not coming from a bale. */
export async function nextLooseCode(): Promise<string> {
  return formatLooseCode(await nextSequence("item:loose"));
}

/** Gives codes to garments of a bale (or loose ones) that predate code generation. */
export async function assignMissingCodes(baleId?: string): Promise<number> {
  const filter = baleId
    ? { BaleId: baleId, deletedAt: null, code: { $exists: false } }
    : {
        $or: [{ BaleId: { $exists: false } }, { BaleId: null }, { BaleId: "" }],
        deletedAt: null,
        code: { $exists: false },
      };
  const bale = baleId ? await baleModel.findById(baleId).select("code").lean<{ code: string }>() : null;
  if (baleId && !bale) throw new Error("Fardo no encontrado");

  const garments = await garmentModel.find(filter).sort({ createdAt: 1 }).select("_id");
  for (const g of garments) {
    const code = bale ? await nextItemCode(bale.code) : await nextLooseCode();
    await garmentModel.updateOne({ _id: g._id }, { code });
  }
  return garments.length;
}
