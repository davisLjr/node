import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config.js";
import Product from "../../server/models/Product.js";
import { getProducts } from "../../server/controllers/productController.js";
import { uploadImages } from "../../server/middleware/uploadMiddleware.js";

dotenv.config();
await connectDB();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ADMIN_PANEL_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  try {
    const { userId } = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.userId = userId;
  } catch {
    return res.status(403).json({ error: "Token inválido" });
  }

  if (req.method === "GET") {
    const products = await getProducts();
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    try {
      await uploadImages(req, res, async () => {
        const imageUrls = req.files.map((f) => f.path);
        const newProduct = await Product.create({
          ...req.body,
          images: imageUrls,
        });
        res.status(201).json(newProduct);
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
