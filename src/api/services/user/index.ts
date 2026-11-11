import { dao } from "../../../db/dao";
import { NotFoundException } from "../../../lib/errors";
import { UpdateProfileBody } from "../../../lib/validators/user";

async function findUser(userId: string) {
  const user = await dao.User.findById(userId);
  if (!user) throw new NotFoundException("User not found");
  return user;
}

const UserService = {
  async getProfile(userId: string) {
    return await findUser(userId);
  },

  async updateProfile(userId: string, body: UpdateProfileBody) {
    await findUser(userId);

    return await dao.User.update(userId, {
      firstName: body.first_name,
      lastName: body.last_name,
      displayName: body.display_name,
      avatarUrl: body.avatar_url,
    });
  },

  async deleteAccount(userId: string) {
    await findUser(userId);
    await dao.User.delete(userId);
  },
};

export { UserService };
