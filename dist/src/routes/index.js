"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = exports.checkoutRouter = exports.catalogoRouter = exports.productRouter = exports.artisanRouter = exports.authRouter = void 0;
const authRoutes_1 = __importDefault(require("./authRoutes"));
exports.authRouter = authRoutes_1.default;
const artisanRoutes_1 = __importDefault(require("./artisanRoutes"));
exports.artisanRouter = artisanRoutes_1.default;
const productRoutes_1 = __importDefault(require("./productRoutes"));
exports.productRouter = productRoutes_1.default;
const catalogoRoutes_1 = __importDefault(require("./catalogoRoutes"));
exports.catalogoRouter = catalogoRoutes_1.default;
const checkoutRoutes_1 = __importDefault(require("./checkoutRoutes"));
exports.checkoutRouter = checkoutRoutes_1.default;
const orderRoutes_1 = __importDefault(require("./orderRoutes"));
exports.orderRouter = orderRoutes_1.default;
