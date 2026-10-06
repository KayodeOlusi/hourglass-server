import { AuthProvider, Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { excludeDeleted, FindOptions } from "../helpers";

const AuthIdentities = {
  async findByProvider(provider: AuthProvider, providerUserId: string, options?: FindOptions) {
    return await prisma.authIdentity.findUnique({
      where: { provider_providerUserId: { provider, providerUserId }, ...excludeDeleted(options) },
    });
  },
  async findByUserId(userId: string, options?: FindOptions) {
    return await prisma.authIdentity.findMany({ where: { userId, ...excludeDeleted(options) } });
  },
  async create(data: Prisma.AuthIdentityUncheckedCreateInput) {
    return await prisma.authIdentity.create({ data });
  },
  async update(id: string, data: Prisma.AuthIdentityUpdateInput) {
    return await prisma.authIdentity.update({ where: { id }, data });
  },
};

export { AuthIdentities };
