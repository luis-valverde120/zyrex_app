"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const checkoutController_1 = require("../controllers/checkoutController");
const checkoutRouter = (0, express_1.Router)();
// Checkout route
checkoutRouter.get("/", authMiddleware_1.ensureAuthenticated, checkoutController_1.displayCheckoutPage);
checkoutRouter.post("/", authMiddleware_1.ensureAuthenticated, checkoutController_1.handlePlaceOrder);
exports.default = checkoutRouter;
