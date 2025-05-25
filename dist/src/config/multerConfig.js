"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Define the destination folder for uploaded files
        cb(null, path_1.default.join(__dirname, "..", "..", "public", "uploads"));
    },
    filename: (req, file, cb) => {
        // Define the filename for the uploaded file
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});
// file filter for get only images
const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpg|jpeg|png|gif|webp/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimeType && extname) {
        return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + allowedTypes));
};
const uploadProductImage = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB
    },
    fileFilter: fileFilter
});
exports.default = uploadProductImage;
