import mongoose from "mongoose";
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
  { label: "Body", value: "BODY" },
  { label: "Blusa", value: "BLUSA" },
  { label: "Otro", value: "OTRO" },
  { label: "Corset", value: "CORSET" },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "No se encontró la variable MONGODB_URI en las variables de entorno.",
      );
    }

    console.log("Conectando a la base de datos...");
    await mongoose.connect(mongoUri);

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

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error ejecutando el seed:", error);
    process.exit(1);
  }
}

seed();
