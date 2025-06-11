import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config.js";
import Category from "../../server/models/Category.js";
import { setCorsHeaders } from "../../utils/setCorsHeaders.js";

dotenv.config();
await connectDB();

export default async function handler(req, res) {
  if (setCorsHeaders(req, res)) return;

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }
  try {
    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(403).json({ error: "Token inválido" });
  }

  if (req.method === "GET") {
    const cats = await Category.find({ owner: jwt.decode(auth.split(" ")[1]).userId });
    return res.json(cats);
  }

  if (req.method === "POST") {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" });
    const payload = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    const newCat = await Category.create({ name, owner: payload.userId });
    return res.status(201).json(newCat);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
