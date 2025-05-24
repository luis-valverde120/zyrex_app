import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Define the destination folder for uploaded files
    cb(null, path.join(__dirname, "..", "..", "public", "uploads"));
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Define the filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

// file filter for get only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Accept images only
  const allowedTypes = /jpg|jpeg|png|gif|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extname) {
    return cb(null, true);
  } 

  cb(new Error("Error: File upload only supports the following filetypes - " + allowedTypes));
};

const uploadProductImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB
  },
  fileFilter: fileFilter
}); 

export default uploadProductImage;
