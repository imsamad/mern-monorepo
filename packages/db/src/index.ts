import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV != "production") {
  global.prisma = prisma;
}

export { prisma as prismaClient };

export * from "@prisma/client";
