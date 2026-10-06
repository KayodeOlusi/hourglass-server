import app from "./src/app";
import http from "http";
import { lib } from "./src/lib";


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

server.listen(PORT, () => {
  lib.logger.info(`Server is running on port ${PORT}`);
});
