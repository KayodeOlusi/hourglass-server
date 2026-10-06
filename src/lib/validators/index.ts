import { NextFunction, Request, Response } from "express";
import { AnySchema, ValidationError } from "yup";
import { ApiBuilders } from "../../api/builders";
import { HttpStatusCodes } from "../../typings/enums/http-codes";

function validator(schema: AnySchema) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      req.body = await schema.validate(req.body ?? {}, { abortEarly: false, stripUnknown: true });
      next();
    } catch (e) {
      return ApiBuilders.buildResponse(res, {
        status: false,
        code: HttpStatusCodes.VALIDATION_ERROR,
        message: (e as ValidationError).errors?.join(", ") ?? "Invalid request body",
        data: null,
      });
    }
  };
}

export { validator };
