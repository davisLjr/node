import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  if (mongoose.connections[0]?.readyState === 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Error al conectar MongoDB", err);
    process.exit(1);
  }
};
