import { Router } from "express";
import { handleAddToCart, displayCart, handleRemoveFromCart, handleUpdateCartQuantity } from "../controllers/cartController";
import { ensureAuthenticated } from "../middlewares/authMiddleware";

const cartRouter = Router();

// Add to cart route
cartRouter.post("/add", ensureAuthenticated, handleAddToCart);

// get page cart
cartRouter.get('/', ensureAuthenticated, displayCart);

// delete item from cart
cartRouter.post('/delete/:productId', ensureAuthenticated, handleRemoveFromCart)

// update item from cart
cartRouter.post('/update/:productId', ensureAuthenticated, handleUpdateCartQuantity)


export default cartRouter;
