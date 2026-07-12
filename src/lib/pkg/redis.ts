import Redis from "ioredis";
import { lib } from "..";

const environment = process.env.NODE_ENV;

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  ...(environment === "production" ? { password: process.env.REDIS_PASSWORD } : {}),
});

async function testRedisConnection(client: typeof redis) {
  try {
    await client.ping();
    lib.logger.info("Redis connection successful");
  } catch (error) {
    lib.logger.error("Redis connection error:", { error });
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

export { redisActions, testRedisConnection, redis };