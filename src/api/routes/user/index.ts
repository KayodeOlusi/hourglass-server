import express from "express";
import { userController } from "../../controllers/user";
import { isAuthenticated } from "../../middlewares";
import { validator } from "../../../lib/validators";
import { UserValidatorSchema } from "../../../lib/validators/user";

function createUserRoute() {
  const router = express.Router();

  router.get("/me", [isAuthenticated], userController.getProfile);
  router.patch(
    "/me",
    [isAuthenticated, validator(UserValidatorSchema.UpdateProfile)],
    userController.updateProfile,
  );
  router.delete("/me", [isAuthenticated], userController.deleteAccount);
  router.get("/me/settings", [isAuthenticated], userController.getSettings);
  router.patch(
    "/me/settings",
    [isAuthenticated, validator(UserValidatorSchema.UpdateSettings)],
    userController.updateSettings,
  );

  return router;
}

export { createUserRoute };
