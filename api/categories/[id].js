// api/categories/[id].js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config.js";
import Category from "../../server/models/Category.js";
import { setCorsHeaders } from "../../utils/setCorsHeaders.js";

dotenv.config();
await connectDB();

export default async function handler(req, res) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }
  try {
    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(403).json({ error: "Token inválido" });
  }

  try {
    await Category.findByIdAndDelete(req.query.id);
    return res.json({ message: "Categoría eliminada" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
