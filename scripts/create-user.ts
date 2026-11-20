import { connectDB } from "../lib/db";
import UserModel from "../lib/models/user.model";
import bcrypt from "bcryptjs";

async function createUser() {
  try {
    await connectDB();

    const email = "diego@dieguito.dev";
    const rawPassword = "Diego1234$";
    const name = "Diego";
    const phone = "+59179778502";
    const role = "admin";

    // 1. Comprobar si ya existe
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.log("❌ El usuario ya existe");
      process.exit(1);
    }

    // 2. Hashear la contraseña obligatoriamente
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 3. Insertar usuario
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
    });

    console.log("✅ Usuario creado con éxito:");
    console.log({ id: user._id, email: user.email, role: user.role });
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    process.exit(1);
  }
}

createUser();
