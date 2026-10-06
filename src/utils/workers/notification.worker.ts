import { lib } from "../../lib";

type NotificationJob = {
  userId: string;
  eventId: string;
  occurrenceDate: string; // YYYY-MM-DD
  minutesBefore: number;
};

const NotificationWorker = {
  listen() {
    lib.queue.listen<NotificationJob>("notification", async (job) => {
      lib.logger.info(`Processing notification job ${job.id} for event ${job.data.eventId}`);
      // FCM push is sent here once the FCM transport exists.
    });
  },
};

export { NotificationWorker };
export type { NotificationJob };
