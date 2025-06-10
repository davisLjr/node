import {v2 as cloudinary} from "cloudinary";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "productos",
    format: async (req, file) => "webp",
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});

export const uploadImages = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
    }
  },
}).array("images", 4);
