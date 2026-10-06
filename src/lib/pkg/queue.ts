import { ConnectionOptions, JobsOptions, Processor, Queue, Worker } from "bullmq";
import { loggerActions as logger } from "../logger";
import { redisOptions } from "./redis";

type QueueName = keyof typeof queues;

const connection: ConnectionOptions = {
  host: redisOptions.host,
  port: redisOptions.port,
  password: redisOptions.password,
  maxRetriesPerRequest: null,
};

const queues = {
  notification: new Queue("notification", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 60_000 },
      removeOnComplete: true,
    },
  }),
};

const workers: Worker[] = [];

const queueActions = {
  async add<T>(name: QueueName, data: T, opts?: JobsOptions) {
    return await queues[name].add(name, data, opts);
  },
  listen<T>(name: QueueName, processor: Processor<T>) {
    const worker = new Worker<T>(queues[name].name, processor, { connection });
    worker.on("failed", (job, error) => {
      logger.error(`Job ${job?.id} on "${name}" queue failed`, error);
    });
    workers.push(worker);
    logger.info(`Listening on "${name}" queue`);
  },
  async close() {
    await Promise.all(workers.map((worker) => worker.close()));
    await Promise.all(Object.values(queues).map((queue) => queue.close()));
  },
};

export { queueActions };
