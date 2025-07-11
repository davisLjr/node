import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../config.js";
import Product from "../../../server/models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import { setCorsHeaders } from "../utils/setCorsHeaders.js";

dotenv.config();
await connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();
app.use(express.json());

const verifyToken = (req, res, next) => {
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
};

app.use(verifyToken);

app.patch("/api/products/remove-images", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const prod = await Product.findById(req.query.id);
    if (!prod) return res.status(404).json({ error: "Producto no encontrado" });

    const publicId = imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`productos/${publicId}`);

    prod.images = prod.images.filter(u => u !== imageUrl);
    await prod.save();
    res.json({ message: "Imagen eliminada", images: prod.images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
