import { prisma } from "../prisma/client";
import { Db } from "./helpers";
import { User } from "./user";
import { AuthIdentities } from "./auth-identity";
import { UserDevices } from "./user-device";
import { Sessions } from "./session";

const dao = {
  User,
  AuthIdentities,
  UserDevices,
  Sessions,
  async ping() {
    await prisma.$queryRaw`SELECT 1`;
  },
  // Pass `tx` to the DAO methods that should commit or roll back together.
  async transaction<T>(fn: (tx: Db) => Promise<T>) {
    return await prisma.$transaction(fn);
  },
};

export { dao };
