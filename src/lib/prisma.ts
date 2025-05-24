import { PrismaClient } from "@prisma/client";


declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  // Prevents creating a new Prisma Client for every API request in development
  global.prisma = prisma;
}