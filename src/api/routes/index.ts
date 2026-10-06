import { Express } from "express";
import { createAuthRoute } from "./auth";

function baseRoutes(route: string = "") {
  return "/api" + route;
}

function buildAppRoutes(app: Express) {
  app.use(baseRoutes("/auth"), createAuthRoute());
}

export { buildAppRoutes };
