import nextConnect from "next-connect";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../config.js";
import Product from "../server/models/Product.js";

dotenv.config();
await connectDB();

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

handler.put(async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.query.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

handler.delete(async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.query.id);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default handler;
