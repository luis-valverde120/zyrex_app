"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cartRouter = (0, express_1.Router)();
// Add to cart route
cartRouter.post("/add", authMiddleware_1.ensureAuthenticated, cartController_1.handleAddToCart);
// get page cart
cartRouter.get('/', authMiddleware_1.ensureAuthenticated, cartController_1.displayCart);
// delete item from cart
cartRouter.post('/delete/:productId', authMiddleware_1.ensureAuthenticated, cartController_1.handleRemoveFromCart);
// update item from cart
cartRouter.post('/update/:productId', authMiddleware_1.ensureAuthenticated, cartController_1.handleUpdateCartQuantity);
exports.default = cartRouter;
