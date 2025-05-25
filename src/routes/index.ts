import { Router, Response, Request } from "express";
import authRouter  from "./authRoutes";
import artisanRouter from "./artisanRoutes";
import productRouter from "./productRoutes";
import catalogoRouter from "./catalogoRoutes";
import checkoutRouter from "./checkoutRoutes";
import orderRouter from "./orderRoutes";

export {
  authRouter,
  artisanRouter,
  productRouter,
  catalogoRouter,
  checkoutRouter,
  orderRouter
}

