import app from "./src/app";
import http from "http";
import { lib } from "./src/lib";


const server = http.createServer(app);
const PORT = process.env.PORT ?? 4000;

function shutdown() {
  lib.logger.info("Shutting down server...");
  server.close(async function () {
    lib.logger.info("Server closed.");
    process.exit(0);
  });
}

server.listen(PORT, () => {
  lib.logger.info(`Server is running on port ${PORT}`);
});
