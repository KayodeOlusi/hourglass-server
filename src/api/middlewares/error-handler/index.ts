import { NextFunction, Request, Response } from "express";
import { ApiBuilders } from "../../builders";
import { handleError } from "../../../utils/handlers";
import { HttpStatusCodes } from "../../../typings/enums/http-codes";

type HttpError = Error & { status?: number; expose?: boolean; type?: string };

// Last line of defence for errors thrown outside a controller's try/catch, mostly body parsing
// (malformed JSON, payload too large). Replaces Express's HTML error page, which leaks stack traces.
function errorHandler(error: HttpError, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(error);

  if (error.type === "entity.parse.failed") {
    return ApiBuilders.buildResponse(res, {
      status: false,
      code: HttpStatusCodes.BAD_REQUEST,
      message: "Request body is not valid JSON",
      data: null,
    });
  }

  // Client errors raised by Express/body-parser carry a safe-to-show message (expose: true).
  if (error.expose && error.status && error.status < HttpStatusCodes.SERVER_ERROR) {
    return ApiBuilders.buildResponse(res, {
      status: false,
      code: error.status as HttpStatusCodes,
      message: error.message,
      data: null,
    });
  }

  return handleError(error, res);
}

export { errorHandler };
