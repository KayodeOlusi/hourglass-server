import { Request, Response } from "express";
import { AuthProvider } from "@prisma/client";
import { services } from "../../services";
import { ApiBuilders } from "../../builders";
import { handleError } from "../../../utils/handlers";
import { BadRequestException } from "../../../lib/errors";
import { HttpStatusCodes } from "../../../typings/enums/http-codes";

const PROVIDERS: string[] = Object.values(AuthProvider);

const authController = {
  async createNonce(req: Request, res: Response) {
    try {
      const nonce = await services.AuthService.createNonce();

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.RESOURCE_CREATED,
        message: "Nonce created successfully",
        data: { nonce },
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async signIn(req: Request, res: Response) {
    try {
      const provider = req.params.provider as string;
      if (!PROVIDERS.includes(provider)) throw new BadRequestException("Unsupported sign-in provider");

      const { user, accessToken, refreshToken } = await services.AuthService.signIn(
        provider as AuthProvider,
        req.body,
        { userAgent: req.get("user-agent"), ipAddress: req.ip },
      );

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Signed in successfully",
        data: user,
        addOns: { access_token: accessToken, refresh_token: refreshToken },
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const { accessToken, refreshToken } = await services.AuthService.refresh(req.body.refresh_token);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Token refreshed successfully",
        data: null,
        addOns: { access_token: accessToken, refresh_token: refreshToken },
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async logout(req: Request, res: Response) {
    try {
      await services.AuthService.logout(res.locals.user.sessionId);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Logged out successfully",
        data: null,
      });
    } catch (e) {
      return handleError(e, res);
    }
  },

  async logoutAll(req: Request, res: Response) {
    try {
      await services.AuthService.logoutAll(res.locals.user.id);

      return ApiBuilders.buildResponse(res, {
        status: true,
        code: HttpStatusCodes.SUCCESSFUL_REQUEST,
        message: "Logged out of all devices successfully",
        data: null,
      });
    } catch (e) {
      return handleError(e, res);
    }
  },
};

export { authController };
