"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = global.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    // Prevents creating a new Prisma Client for every API request in development
    global.prisma = exports.prisma;
}
