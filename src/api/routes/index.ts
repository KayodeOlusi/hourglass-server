import { Express } from "express";
import { createAuthRoute } from "./auth";
import { createHealthRoute } from "./health";
import { createUserRoute } from "./user";

function baseRoutes(route: string = "") {
  return "/api" + route;
}

function buildAppRoutes(app: Express) {
  // Outside /api: infrastructure probes it (docker-compose.prod.yml healthcheck), not the app.
  app.use("/health", createHealthRoute());
  app.use(baseRoutes("/auth"), createAuthRoute());
  app.use(baseRoutes("/users"), createUserRoute());
}

export { buildAppRoutes };
