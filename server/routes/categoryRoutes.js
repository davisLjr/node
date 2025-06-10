import express from "express";
import jwt from "jsonwebtoken";
import Category from "../models/Category.js";

const router = express.Router();

// Middleware auth
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(403).json({ error: "Token inválido" });
  }
}

// Crear categoría
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" });

  const newCategory = new Category({ name, owner: req.userId });
  const saved = await newCategory.save();
  res.status(201).json(saved);
});

// Listar categorías del usuario
router.get("/", authMiddleware, async (req, res) => {
  const categories = await Category.find({ owner: req.userId });
  res.json(categories);
});

export default router;
