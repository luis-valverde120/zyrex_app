"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multerConfig_1 = __importDefault(require("../config/multerConfig"));
const productController_1 = require("../controllers/productController");
const productRouter = (0, express_1.Router)();
// ---- New Product ----
productRouter.get("/new", authMiddleware_1.ensureAuthenticated, authMiddleware_1.ensureArtisan, productController_1.displayNewProductForm);
// --- Create Product ---
productRouter.post("/new", authMiddleware_1.ensureAuthenticated, authMiddleware_1.ensureArtisan, multerConfig_1.default.single("imagenProducto"), productController_1.handleCreateProduct);
// ---- Edit Product ----
productRouter.get("/:id/edit", authMiddleware_1.ensureAuthenticated, authMiddleware_1.ensureArtisan, productController_1.displayEditProductForm);
// --- Update Product ---
productRouter.post("/:id/edit", authMiddleware_1.ensureAuthenticated, authMiddleware_1.ensureArtisan, multerConfig_1.default.single("imagenProducto"), productController_1.handleEditProduct);
// ---- Delete Product ----
productRouter.post("/:id/delete", authMiddleware_1.ensureAuthenticated, authMiddleware_1.ensureArtisan, productController_1.handleDeleteProduct);
// ---- Get Product ----
productRouter.get("/:id", productController_1.displayProductInfo);
exports.default = productRouter;
