import { loggerActions } from "./logger";
import { redisActions } from "./pkg/redis";

const lib = {
  logger: loggerActions,
  redis: redisActions,
};

export { lib };