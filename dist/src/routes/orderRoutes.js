"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const orderRouter = (0, express_1.Router)();
orderRouter.get("/confirmation/:pedidoId", authMiddleware_1.ensureAuthenticated, orderController_1.displayOrderConfirmation);
orderRouter.get("/my-orders", authMiddleware_1.ensureAuthenticated, orderController_1.listOrders);
exports.default = orderRouter;
