import { AuthProvider, Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";

const AuthIdentities = {
  async findByProvider(provider: AuthProvider, providerUserId: string) {
    return await prisma.authIdentity.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
    });
  },
  async findByUserId(userId: string) {
    return await prisma.authIdentity.findMany({ where: { userId } });
  },
  async create(data: Prisma.AuthIdentityUncheckedCreateInput) {
    return await prisma.authIdentity.create({ data });
  },
  async update(id: string, data: Prisma.AuthIdentityUpdateInput) {
    return await prisma.authIdentity.update({ where: { id }, data });
  },
};

export { AuthIdentities };
