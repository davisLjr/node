import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  currency: { type: String, enum: ["USD", "VES"], default: "USD" },
  available: { type: Boolean, default: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  deliveryTime: String,
  images: [String],
});

export default mongoose.model("Product", productSchema);
