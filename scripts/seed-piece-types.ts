import { connectDB } from "../lib/db";
import PieceTypeModel from "../lib/models/piece-type.model";

const PIECE_OPTIONS = [
  { label: "Polera", value: "POLERA" },
  { label: "Abrigo", value: "ABRIGO" },
  { label: "Vestido", value: "VESTIDO" },
  { label: "Top", value: "TOP" },
  { label: "Pantalón", value: "PANTALON" },
  { label: "Camisa", value: "CAMISA" },
  { label: "Falda", value: "FALDA" },
  { label: "Short", value: "SHORT" },
  { label: "Jeans", value: "JEANS" },
  { label: "Chaqueta / Chamarra", value: "CHAQUETA" },
  { label: "Polerón / Sudadera", value: "POLERON" },
  { label: "Chaleco", value: "CHALECO" },
  { label: "Calzado", value: "CALZADO" },
  { label: "Accesorio", value: "ACCESORIO" },
  { label: "Otro", value: "OTRO" },
];

async function seed() {
  try {
    console.log("Conectando a la base de datos...");
    await connectDB();

    console.log("Insertando/Actualizando tipos de prendas...");

    const operations = PIECE_OPTIONS.map((item) => ({
      updateOne: {
        filter: { value: item.value },
        update: { $set: item },
        upsert: true,
      },
    }));

    const result = await PieceTypeModel.bulkWrite(operations);

    console.log("✅ Seed completado con éxito:");
    console.log(`- Insertados: ${result.upsertedCount}`);
    console.log(`- Modificados: ${result.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error ejecutando el seed:", error);
    process.exit(1);
  }
}

seed();
