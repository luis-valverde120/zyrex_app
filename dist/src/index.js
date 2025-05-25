"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
require("dotenv/config");
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "localhost";
app_1.default.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
