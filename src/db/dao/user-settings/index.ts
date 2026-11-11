import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { Db } from "../helpers";

type SettingsInput = Omit<
  Prisma.UserSettingsUncheckedCreateInput,
  "id" | "userId"
>;

const UserSettings = {
  async findOrCreate(
    userId: string,
    data: SettingsInput = {},
    db: Db = prisma,
  ) {
    return await db.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: {},
    });
  },
  async upsert(userId: string, data: SettingsInput) {
    return await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },
};

export { UserSettings };
