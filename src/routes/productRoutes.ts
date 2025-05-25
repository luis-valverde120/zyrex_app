import { Router } from "express";
import { ensureAuthenticated, ensureArtisan } from "../middlewares/authMiddleware";
import uploadProductImage from "../config/multerConfig";
import { 
  displayNewProductForm, 
  handleCreateProduct, 
  displayEditProductForm, 
  handleEditProduct, 
  handleDeleteProduct, 
  displayProductInfo} from "../controllers/productController";

const productRouter = Router();

// ---- New Product ----
productRouter.get("/new", ensureAuthenticated, ensureArtisan, displayNewProductForm);

// --- Create Product ---
productRouter.post("/new", ensureAuthenticated, ensureArtisan, uploadProductImage.single("imagenProducto"), handleCreateProduct);

// ---- Edit Product ----
productRouter.get("/:id/edit", ensureAuthenticated, ensureArtisan, displayEditProductForm);

// --- Update Product ---
productRouter.post("/:id/edit", ensureAuthenticated, ensureArtisan, uploadProductImage.single("imagenProducto"), handleEditProduct);

// ---- Delete Product ----
productRouter.post("/:id/delete", ensureAuthenticated, ensureArtisan, handleDeleteProduct);

// ---- Get Product ----
productRouter.get("/:id", displayProductInfo);



export default productRouter;