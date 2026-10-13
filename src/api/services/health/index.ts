import { lib } from "../../../lib";
import { dao } from "../../../db/dao";

// Under the 5s Docker healthcheck timeout, so a hung dependency reports "down" instead of timing out.
const CHECK_TIMEOUT_MS = 2000;

type Status = "up" | "down";

async function probe(name: string, check: () => Promise<unknown>): Promise<Status> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${name} health check timed out`)), CHECK_TIMEOUT_MS);
  });

  try {
    await Promise.race([check(), timeout]);
    return "up";
  } catch (error) {
    lib.logger.error(`${name} health check failed`, error as Error);
    return "down";
  } finally {
    clearTimeout(timer);
  }
}

const HealthService = {
  async check() {
    const [db, redis] = await Promise.all([probe("Database", dao.ping), probe("Redis", lib.redis.ping)]);

    return {
      healthy: db === "up" && redis === "up",
      checks: { db, redis },
      uptime: Math.round(process.uptime()),
    };
  },
};

export { HealthService };
