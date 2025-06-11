import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config.js";
import Product from "../../server/models/Product.js";
import { getProducts } from "../../server/controllers/productController.js";
import { uploadImages } from "../../server/middleware/uploadMiddleware.js";
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
