import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { connectDB } from "../config.js";
import Category from "../server/models/Category.js";
import { setCorsHeaders } from "../utils/setCorsHeaders.js";

dotenv.config();
await connectDB();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (setCorsHeaders(req, res)) return;
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

app.get("/api/categories", async (req, res) => {
  const cats = await Category.find({ owner: req.userId });
  res.json(cats);
});

app.post("/api/categories", async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" });
  const newCat = await Category.create({ name, owner: req.userId });
  res.status(201).json(newCat);
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Categoría eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
