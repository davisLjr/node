import { createRequire } from "module";
const require = createRequire(import.meta.url);
const nextConnectPkg = require("next-connect");
const nextConnect = nextConnectPkg.default ?? nextConnectPkg;
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../config.js";
import User from "../server/models/User.js";

dotenv.config();
await connectDB();

const handler = nextConnect();

handler.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token });
});

export default handler;
