import { Request, Response } from "express";
import { services } from "../../services";
import { ApiBuilders } from "../../builders";
import { handleError } from "../../../utils/handlers";
import { HttpStatusCodes } from "../../../typings/enums/http-codes";

const healthController = {
  async check(req: Request, res: Response) {
    try {
      const { healthy, ...data } = await services.HealthService.check();

      return ApiBuilders.buildResponse(res, {
        status: healthy,
        code: healthy ? HttpStatusCodes.SUCCESSFUL_REQUEST : HttpStatusCodes.SERVICE_UNAVAILABLE,
        message: healthy ? "OK" : "One or more dependencies are down",
        data,
      });
    } catch (e) {
      return handleError(e, res);
    }
  },
};

export { healthController };
