import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";

const UserDevices = {
  async create(data: Prisma.UserDeviceUncheckedCreateInput) {
    return await prisma.userDevice.create({ data });
  },
  // A device token belongs to one physical device; whoever signs in on it last owns it.
  async upsertByToken(deviceToken: string, data: Prisma.UserDeviceUncheckedCreateInput) {
    return await prisma.userDevice.upsert({
      where: { deviceToken },
      create: { ...data, deviceToken },
      update: { ...data, deviceToken, deletedAt: null },
    });
  },
};

export { UserDevices };
