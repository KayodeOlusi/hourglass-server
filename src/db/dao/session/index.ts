import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";

const Sessions = {
  async create(data: Prisma.SessionUncheckedCreateInput) {
    return await prisma.session.create({ data });
  },
  async findActiveByHash(refreshTokenHash: string) {
    return await prisma.session.findFirst({
      where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },
  // Conditional on the old hash so two concurrent refreshes can't both succeed.
  async rotate(id: string, oldHash: string, newHash: string) {
    const { count } = await prisma.session.updateMany({
      where: { id, refreshTokenHash: oldHash, revokedAt: null },
      data: { refreshTokenHash: newHash, lastUsedAt: new Date() },
    });
    return count === 1;
  },
  async revoke(id: string) {
    return await prisma.session.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
  async revokeAllByUserId(userId: string) {
    return await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};

export { Sessions };
