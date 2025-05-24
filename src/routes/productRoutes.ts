import { Router } from "express";
import { ensureAuthenticated, ensureArtisan } from "../middlewares/authMiddleware";
import uploadProductImage from "../config/multerConfig";
import { displayNewProductForm, handleCreateProduct } from "../controllers/productController";

const productRouter = Router();

// get routes
// ---- New Product ----
productRouter.get("/new", ensureAuthenticated, ensureArtisan, displayNewProductForm);

// post routes
productRouter.post("/new", ensureAuthenticated, ensureArtisan, uploadProductImage.single("imagenProducto"), handleCreateProduct);

export default productRouter;