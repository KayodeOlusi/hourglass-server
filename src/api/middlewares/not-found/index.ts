import { Request, Response } from "express";
import { ApiBuilders } from "../../builders";
import { HttpStatusCodes } from "../../../typings/enums/http-codes";

// Registered after all routes, so anything that reaches it matched nothing.
function notFound(req: Request, res: Response) {
  return ApiBuilders.buildResponse(res, {
    status: false,
    code: HttpStatusCodes.NOT_FOUND,
    message: `Cannot ${req.method} ${req.originalUrl.split("?")[0]}`,
    data: null,
  });
}

export { notFound };
