import express from "express";
import { authController } from "../../controllers/auth";
import { isAuthenticated } from "../../middlewares";
import { validator } from "../../../lib/validators";
import { AuthValidatorSchema } from "../../../lib/validators/auth";

function createAuthRoute() {
  const router = express.Router();

  router.post(
    "/nonce",
    authController.createNonce
  );
  router.post(
    "/oauth/:provider",
    [validator(AuthValidatorSchema.SignIn)],
    authController.signIn
  );
  router.post(
    "/refresh",
    [validator(AuthValidatorSchema.Refresh)],
    authController.refresh
  );
  router.post(
    "/logout",
    [isAuthenticated],
    authController.logout
  );
  router.post(
    "/logout-all",
    [isAuthenticated],
    authController.logoutAll
  );

  return router;
}

export { createAuthRoute };
