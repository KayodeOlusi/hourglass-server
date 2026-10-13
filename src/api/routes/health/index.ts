import express from "express";
import { healthController } from "../../controllers/health";

function createHealthRoute() {
  const router = express.Router();

  router.get(
    "/",
    healthController.check
  );

  return router;
}

export { createHealthRoute };
