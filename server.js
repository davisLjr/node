import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config.js";
import productRoutes from "./server/routes/productRoutes.js";
import authRoutes from "./server/routes/authRoutes.js";
import categoryRoutes from "./server/routes/categoryRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// 🌐 cuando tenga el front
// const allowedOrigins = [process.env.ADMIN_PANEL_ORIGIN];
// app.use(cors({
//   origin: allowedOrigins,
// }));

app.use(cors());

app.use(express.json());

connectDB();

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
