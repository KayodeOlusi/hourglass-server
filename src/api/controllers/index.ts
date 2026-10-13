import { userController } from "./user";
import { authController } from "./auth";
import { healthController } from "./health";

const controllers = {
  user: userController,
  auth: authController,
  health: healthController,
};

export { controllers };
