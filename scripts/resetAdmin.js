import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../server/models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Conectado a MongoDB");

    // Borrar el admin antiguo
    const del = await User.deleteOne({ email: "admin@example.com" });
    if (del.deletedCount) {
      console.log("🗑️ Usuario admin@example.com borrado");
    } else {
      console.log("⚠️ No se encontró admin@example.com para borrar");
    }

    // Crear el nuevo admin
    const passwordHash = await bcrypt.hash("0000000", 10);
    const newAdmin = await User.create({
      email: "adminone@example.com",
      passwordHash,
    });
    console.log("✅ Nuevo usuario creado:", newAdmin.email);

  } catch (err) {
    console.error("❌ Error en el script:", err);
  } finally {
    process.exit();
  }
};

run();
