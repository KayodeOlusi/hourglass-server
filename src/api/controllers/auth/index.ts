import { services } from "../../services";

// HTTP layer for auth routes. Calls services.AuthService, never the DAO directly.
const authController = {};

export { authController };
