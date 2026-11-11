import { Request, Response } from "express";
import { services } from "../../services";
import { ApiBuilders } from "../../builders";
import { serializers } from "../../serializers";
import { handleError } from "../../../utils/handlers";
import { HttpStatusCodes } from "../../../typings/enums/http-codes";

// HTTP layer for user routes. Calls services.UserService, never the DAO directly.
const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const user = await services.UserService.getProfile(res.locals.user.id);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Profile fetched successfully",
        data: serializers.UserSerializer.toPublic(user),
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const user = await services.UserService.updateProfile(res.locals.user.id, req.body);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Profile updated successfully",
        data: serializers.UserSerializer.toPublic(user),
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async getSettings(req: Request, res: Response) {
    try {
      const settings = await services.UserService.getSettings(res.locals.user.id);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Settings fetched successfully",
        data: serializers.UserSettingsSerializer.toPublic(settings),
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async updateSettings(req: Request, res: Response) {
    try {
      const settings = await services.UserService.updateSettings(res.locals.user.id, req.body);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Settings updated successfully",
        data: serializers.UserSettingsSerializer.toPublic(settings),
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async deleteAccount(req: Request, res: Response) {
    try {
      await services.UserService.deleteAccount(res.locals.user.id);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Account deleted successfully",
        data: null,
      });
    } catch (e) {
      return handleError(e, res);
    }
  },
};

export { userController };
