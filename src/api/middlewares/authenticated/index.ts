import { NextFunction, Request, Response } from "express";
import { ApiBuilders } from "../../builders";
import { services } from "../../services";
import { HttpStatusCodes } from "../../../typings/enums/http-codes";

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return ApiBuilders.buildResponse(res, {
      status: false,
      code: HttpStatusCodes.UNAUTHORIZED,
      message: "Missing access token",
      data: null,
    });
  }

  try {
    const { sub, sid } = services.TokenService.verifyAccessToken(header.slice("Bearer ".length));
    res.locals.user = { id: sub, sessionId: sid };
    next();
  } catch {
    return ApiBuilders.buildResponse(res, {
      status: false,
      code: HttpStatusCodes.UNAUTHORIZED,
      message: "Invalid or expired access token",
      data: null,
    });
  }
}

export { isAuthenticated };
