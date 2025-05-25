import { Router } from "express";
import { displayOrderConfirmation, listOrders } from "../controllers/orderController";
import { ensureAuthenticated } from "../middlewares/authMiddleware";

const orderRouter = Router();

orderRouter.get("/confirmation/:pedidoId", ensureAuthenticated, displayOrderConfirmation);

orderRouter.get("/my-orders", ensureAuthenticated, listOrders);

export default orderRouter;
