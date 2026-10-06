import { Response } from "express";
import { HttpStatusCodes } from "../../typings/enums/http-codes";

type HttpResponse = {
  code: HttpStatusCodes;
  message: string;
  status: boolean;
  data: any;
  addOns?: Record<string, any>;
};

const ApiBuilders = {
  buildResponse(res: Response, obj: HttpResponse) {
    const result: Record<string, any> = {
      status: obj.status,
      message: obj.message,
    };

    if (obj.data) result.data = obj.data;
    if (obj.addOns) Object.assign(result, obj.addOns);

    return res.status(obj.code).json(result);
  },
};

export { ApiBuilders };
