import { dao } from "../../../db/dao";
import { NotFoundException } from "../../../lib/errors";
import {
  UpdateProfileBody,
  UpdateSettingsBody,
} from "../../../lib/validators/user";

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

  async getSettings(userId: string) {
    await findUser(userId);
    return await dao.UserSettings.findOrCreate(userId);
  },

  async updateSettings(userId: string, body: UpdateSettingsBody) {
    await findUser(userId);

    return await dao.UserSettings.upsert(userId, {
      timezone: body.timezone,
      locale: body.locale,
      defaultReminderMinutes: body.default_reminder_minutes,
      defaultEventDurationMinutes: body.default_event_duration_minutes,
      timezoneBehavior: body.timezone_behavior,
      criticalRemindersEnabled: body.critical_reminders_enabled,
      theme: body.theme,
      notificationSound: body.notification_sound,
    });
  },

  async deleteAccount(userId: string) {
    await findUser(userId);
    await dao.User.delete(userId);
  },
};

export { UserService };
