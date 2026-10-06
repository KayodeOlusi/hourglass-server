import { Response } from "express";
import { lib } from "../../lib";
import { ApiBuilders } from "../../api/builders";
import { HttpStatusCodes } from "../../typings/enums/http-codes";

function handleError(error: unknown, res: Response) {
  const code = (error as { code?: unknown })?.code;

  if (error instanceof Error && typeof code === "number" && code < HttpStatusCodes.SERVER_ERROR) {
    return ApiBuilders.buildResponse(res, { status: false, code, message: error.message, data: null });
  }

  // An upstream outage: log it, but tell the client it's temporary so it can retry.
  if (error instanceof Error && code === HttpStatusCodes.SERVICE_UNAVAILABLE) {
    lib.logger.error("Service unavailable", error);
    return ApiBuilders.buildResponse(res, { status: false, code, message: error.message, data: null });
  }

  lib.logger.error("Unhandled error", error as Error);
  return ApiBuilders.buildResponse(res, {
    status: false,
    code: HttpStatusCodes.SERVER_ERROR,
    message: "Something went wrong. Try again later",
    data: null,
  });
}

export { handleError };
