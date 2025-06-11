import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config.js";
import Product from "../../server/models/Product.js";
import { uploadImages } from "../../server/middleware/uploadMiddleware.js";
import { setCorsHeaders } from "../../utils/setCorsHeaders.js";

dotenv.config();
await connectDB();

export default async function handler(req, res) {
  if (setCorsHeaders(req, res)) return;

  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      res.status(403).json({ error: "Token no proporcionado" });
      return;
    }

    const { userId } = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.userId = userId;

    if (req.method === "GET") {
      try {
        const products = await Product.find();
        res.status(200).json(products);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      return;
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
      return;
    }

    res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
