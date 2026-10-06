import { prisma } from "./prisma/client";
import { lib } from "../lib";

async function DbBootstrap() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    lib.logger.info("DB connection has been established successfully.");
  } catch (error) {
    lib.logger.error("Error in db boostrap", {
      error,
    });
    process.exit(1);
  }
}

export { DbBootstrap };
