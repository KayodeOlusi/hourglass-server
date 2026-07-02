import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const globalFromPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalFromPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalFromPrisma.prisma = prisma;
}
