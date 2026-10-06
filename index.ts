import app from "./src/app";
import http from "http";
import { lib } from "./src/lib";
import { prisma } from "./src/db/prisma/client";
import { DbBootstrap } from "./src/db/bootstrap";
import { redis, testRedisConnection } from "./src/lib/pkg/redis";
import { NotificationWorker } from "./src/utils/workers/notification.worker";

const server = http.createServer(app);
const PORT = process.env.PORT ?? 4000;


async function shutdown() {
  lib.logger.info("Shutting down server...");
  server.close(async function () {
    lib.logger.info("HTTP server closed.");
    await lib.queue.close();
    await redis.quit();
    await prisma.$disconnect();
    lib.logger.info("Connections closed.");
    process.exit(0);
  });
}

DbBootstrap()
  .then(async function () {
    await testRedisConnection(redis);
    NotificationWorker.listen();
    server.listen(PORT, () => {
      lib.logger.info(`Server is running on port ${PORT}`);
    });

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  })
  .catch(function (error) {
    lib.logger.error("Failed to bootstrap db", error);
    process.exit(1);
  })
