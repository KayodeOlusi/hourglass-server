import { prisma } from "./prisma/client";
import { loggerActions as logger } from "../lib/logger";
import { lib } from "../lib";

async function DbBootstrap() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info("DB connection has been established successfully.");
  } catch (error) {
    lib.logger.error("Error in db boostrap", {
      error,
    });
    process.exit(1);
  }
}

export { DbBootstrap };
