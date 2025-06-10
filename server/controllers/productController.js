import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

export const createProduct = async (req, res) => {
  const newProduct = new Product(req.body);
  const saved = await newProduct.save();
  res.status(201).json(saved);
};
