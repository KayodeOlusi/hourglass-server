import { User } from "@prisma/client";

// The public shape of a user. Internal fields (status, deletedAt, activity timestamps) stay out,
// so the response doesn't change whenever the table does.
const UserSerializer = {
  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      display_name: user.displayName,
      avatar_url: user.avatarUrl,
      created_at: user.createdAt,
    };
  },
};

export { UserSerializer };
