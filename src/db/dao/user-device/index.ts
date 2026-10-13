import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { Db } from "../helpers";

type DeviceData = Omit<Prisma.UserDeviceUncheckedCreateInput, "installationId">;

const UserDevices = {
  async create(data: Prisma.UserDeviceUncheckedCreateInput, db: Db = prisma) {
    return await db.userDevice.create({ data });
  },
  // One row per app install; whoever signs in on it last owns it. A push token belongs to one
  // physical device, so it's taken off any other install still holding it (e.g. after a reinstall).
  async upsertByInstallation(installationId: string, data: DeviceData, db: Db = prisma) {
    if (data.deviceToken) {
      await db.userDevice.updateMany({
        where: { deviceToken: data.deviceToken, installationId: { not: installationId } },
        data: { deviceToken: null },
      });
    }

    return await db.userDevice.upsert({
      where: { installationId },
      create: { ...data, installationId },
      update: { ...data, deletedAt: null },
    });
  },
};

export { UserDevices };
