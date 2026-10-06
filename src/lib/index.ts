import { loggerActions } from "./logger";
import { redisActions } from "./pkg/redis";
import { queueActions } from "./pkg/queue";

const lib = {
  logger: loggerActions,
  redis: redisActions,
  queue: queueActions,
};

export { lib };
