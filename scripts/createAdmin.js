import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../server/models/User.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash("1234", 10);

  await User.create({
    email: "admin@example.com",
    passwordHash,
  });

  console.log("✅ Usuario admin creado");
  process.exit();
};

run();
