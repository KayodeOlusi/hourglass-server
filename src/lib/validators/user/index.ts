import * as yup from "yup";
import { Theme, TimezoneBehavior } from "@prisma/client";
import { fields } from "../fields";

function hasAnyField(body?: object) {
  return Object.values(body ?? {}).some(value => value !== undefined);
}

function optionalText(max: number) {
  return yup
    .string()
    .trim()
    .max(max)
    .transform(value => (value === "" ? null : value))
    .nullable()
    .optional();
}

const UserValidatorSchema = {
  UpdateProfile: yup
    .object({
      first_name: optionalText(100),
      last_name: optionalText(100),
      display_name: optionalText(50),
      avatar_url: yup.string().trim().url().max(2048).nullable().optional(),
    })
    .test("not-empty", "Provide at least one field to update", hasAnyField),
  UpdateSettings: yup
    .object({
      timezone: fields.timezone().optional(),
      locale: fields.locale().optional(),
      default_reminder_minutes: yup.number().integer().min(0).max(10080).optional(), // up to a week
      default_event_duration_minutes: yup.number().integer().min(1).max(1440).optional(), // up to a day
      timezone_behavior: yup.string().oneOf(Object.values(TimezoneBehavior)).optional(),
      critical_reminders_enabled: yup.boolean().optional(),
      theme: yup.string().oneOf(Object.values(Theme)).optional(),
      notification_sound: yup.string().trim().min(1).max(100).optional(),
    })
    .test("not-empty", "Provide at least one field to update", hasAnyField),
};

type UpdateProfileBody = yup.InferType<
  typeof UserValidatorSchema.UpdateProfile
>;
type UpdateSettingsBody = yup.InferType<
  typeof UserValidatorSchema.UpdateSettings
>;

export { UserValidatorSchema };
export type { UpdateProfileBody, UpdateSettingsBody };
