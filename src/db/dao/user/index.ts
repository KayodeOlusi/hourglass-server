import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { excludeDeleted, FindOptions } from "../helpers";

const User = {
  async findById(id: string, options?: FindOptions) {
    return await prisma.user.findUnique({ where: { id, ...excludeDeleted(options) } });
  },
  async findByEmail(email: string, options?: FindOptions) {
    return await prisma.user.findUnique({ where: { email, ...excludeDeleted(options) } });
  },
  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ data });
  },
  async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({ where: { id }, data });
  },
  async delete(id: string) {
    const now = new Date();

    return await prisma.$transaction([
      prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: now } }),
      prisma.userDevice.updateMany({ where: { userId: id, deletedAt: null }, data: { deletedAt: now, pushEnabled: false } }),
      prisma.authIdentity.updateMany({ where: { userId: id, deletedAt: null }, data: { deletedAt: now } }),
      prisma.user.update({ where: { id }, data: { status: "DELETED", deletedAt: now } }),
    ]);
  },
};

export { User };
