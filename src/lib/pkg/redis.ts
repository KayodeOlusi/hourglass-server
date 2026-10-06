import Redis, { RedisOptions } from "ioredis";
import { loggerActions as logger } from "../logger";

const environment = process.env.NODE_ENV;

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  ...(environment === "production" ? { password: process.env.REDIS_PASSWORD } : {}),
};

const redis = new Redis(redisOptions);

async function testRedisConnection(client: typeof redis) {
  try {
    await client.ping();
    logger.info("Redis connection has been established successfully.");
  } catch (error) {
    logger.error("Error in Redis connection", error as Error);
    throw error;
  }
}

const redisActions = {
  async add(key: string, value: string) {
    return await redis.set(key, value);
  },
  async get(key: string) {
    return await redis.get(key);
  },
  async delete(key: string) {
    return await redis.del(key);
  },
  async addWithExp(key: string, value: string, exp: number) {
    return await redis.set(key, value, "EX", exp);
  },
};

export { redisActions, testRedisConnection, redisOptions, redis };
