type FindOptions = {
  withDeleted?: boolean;
};

// Getters skip soft-deleted rows unless the caller explicitly asks for them.
function excludeDeleted(options: FindOptions = {}) {
  return options.withDeleted ? {} : { deletedAt: null };
}

export { excludeDeleted };
export type { FindOptions };
