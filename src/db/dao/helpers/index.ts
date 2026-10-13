import { Prisma } from "@prisma/client";

type FindOptions = {
  withDeleted?: boolean;
};

// Either the shared client or the `tx` handed out by dao.transaction, so writes can join a transaction.
type Db = Prisma.TransactionClient;

// Getters skip soft-deleted rows unless the caller explicitly asks for them.
function excludeDeleted(options: FindOptions = {}) {
  return options.withDeleted ? {} : { deletedAt: null };
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export { excludeDeleted, isUniqueViolation };
export type { FindOptions, Db };
