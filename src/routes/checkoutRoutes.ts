import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import { displayCheckoutPage, handlePlaceOrder } from "../controllers/checkoutController";

const checkoutRouter = Router();

// Checkout route
checkoutRouter.get("/", ensureAuthenticated, displayCheckoutPage);

checkoutRouter.post("/", ensureAuthenticated, handlePlaceOrder);

export default checkoutRouter;