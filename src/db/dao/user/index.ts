import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";

const User = {
  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  },
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  },
  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ data });
  },
  async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({ where: { id }, data });
  },
};

export { User };
