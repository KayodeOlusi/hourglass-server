import { UserSettings } from "@prisma/client";

const UserSettingsSerializer = {
  toPublic(settings: UserSettings) {
    return {
      timezone: settings.timezone,
      locale: settings.locale,
      default_reminder_minutes: settings.defaultReminderMinutes,
      default_event_duration_minutes: settings.defaultEventDurationMinutes,
      timezone_behavior: settings.timezoneBehavior,
      critical_reminders_enabled: settings.criticalRemindersEnabled,
      theme: settings.theme,
      notification_sound: settings.notificationSound,
      updated_at: settings.updatedAt,
    };
  },
};

export { UserSettingsSerializer };
