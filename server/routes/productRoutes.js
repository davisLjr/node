import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import Product from "../models/Product.js";
import { getProducts } from "../controllers/productController.js";
import { uploadImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Middleware de autenticación
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

// Obtener productos públicos
router.get("/", getProducts);

// Crear producto con imágenes
router.post("/", authMiddleware, uploadImages, async (req, res) => {
  try {
    const imagePaths = req.files?.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    }) || [];

    if (imagePaths.length > 4) {
      return res.status(400).json({ error: "Solo se permiten hasta 4 imágenes" });
    }

    const newProduct = new Product({
      ...req.body,
      images: imagePaths,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

// Eliminar producto
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product?.images) {
      for (const url of product.images) {
        const filename = url.split("/uploads/")[1];
        const filePath = path.join("uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

// Actualizar producto (máximo 4 imágenes)
router.put("/:id", authMiddleware, uploadImages, async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const newImagePaths = req.files?.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    }) || [];

    const finalImages = newImagePaths.length
      ? [...(existingProduct.images || []), ...newImagePaths]
      : existingProduct.images;

    if (finalImages.length > 4) {
      return res.status(400).json({ error: "Solo se permiten hasta 4 imágenes por producto" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images: finalImages,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// Eliminar una imagen específica de un producto y del disco
router.patch("/:id/remove-image", authMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No se proporcionó la URL de la imagen a eliminar" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const updatedImages = product.images.filter(img => img !== imageUrl);

    // Borrar archivo físico
    const filename = imageUrl.split("/uploads/")[1];
    const filePath = path.join("uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Product.findByIdAndUpdate(req.params.id, {
      images: updatedImages
    });

    res.json({ message: "Imagen eliminada correctamente", images: updatedImages });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
});

export default router;
