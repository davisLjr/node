import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../config.js";
import Category from "../server/models/Category.js";

dotenv.config();
await connectDB();

const { default: nextConnect } = await import("next-connect");


const handler = nextConnect();

handler.use((req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return res.status(403).json({ error: "Token no proporcionado" });
  try {
    const { userId } = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(403).json({ error: "Token inválido" });
  }
});

handler.get(async (req, res) => {
  const cats = await Category.find({ owner: req.userId });
  res.json(cats);
});


handler.post(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" });
  const newCat = await Category.create({ name, owner: req.userId });
  res.status(201).json(newCat);
});

export default handler;
