import { NextFunction, Request, Response } from "express";
import { lib } from "../../../lib";

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on("close", () => {
    const path = req.originalUrl.split("?")[0];
    if (path === "/health" && res.statusCode < 400) return;

    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const userId = res.locals.user?.id;
    const aborted = !res.writableFinished;
    const line = `${req.method} ${path} ${aborted ? "aborted" : res.statusCode} ${ms.toFixed(1)}ms${userId ? ` user=${userId}` : ""}`;

    if (aborted || res.statusCode >= 500) lib.logger.error(line);
    else if (res.statusCode >= 400) lib.logger.warn(line);
    else lib.logger.info(line);
  });

  next();
}

export { requestLogger };
