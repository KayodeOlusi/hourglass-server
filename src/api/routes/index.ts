import { Express } from "express";
import { createAuthRoute } from "./auth";
import { createHealthRoute } from "./health";

function baseRoutes(route: string = "") {
  return "/api" + route;
}

function buildAppRoutes(app: Express) {
  // Outside /api: infrastructure probes it (docker-compose.prod.yml healthcheck), not the app.
  app.use("/health", createHealthRoute());
  app.use(baseRoutes("/auth"), createAuthRoute());
}

export { buildAppRoutes };
