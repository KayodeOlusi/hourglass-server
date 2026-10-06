import { loggerActions } from "./logger";
import { redisActions } from "./pkg/redis";
import { queueActions } from "./pkg/queue";
import { oauthActions } from "./pkg/oauth";

const lib = {
  logger: loggerActions,
  redis: redisActions,
  queue: queueActions,
  oauth: oauthActions,
};

export { lib };
