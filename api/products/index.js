const ncModule = await import("next-connect");
const nextConnect = ncModule.default ?? ncModule;
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config.js";
import Product from "../../server/models/Product.js";
import { getProducts } from "../../server/controllers/productController.js";
import { uploadImages } from "../../server/middleware/uploadMiddleware.js";

dotenv.config();
await connectDB();

const handler = nextConnect();

handler.get(async (req, res) => {
  const products = await getProducts();
  return res.status(200).json(products);
});

handler.post(
  (req, res, next) => {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) return res.status(403).json({ error: "Token no proporcionado" });
    try {
      const { userId } = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
      req.userId = userId;
      next();
    } catch {
      return res.status(403).json({ error: "Token inválido" });
    }
  },
  uploadImages,
  async (req, res) => {
    try {
      const imageUrls = req.files.map(f => f.path);
      const newProduct = await Product.create({
        ...req.body,
        images: imageUrls,
      });
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default handler;
