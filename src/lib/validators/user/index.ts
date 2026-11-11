import * as yup from "yup";

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
    .test("not-empty", "Provide at least one field to update", body =>
      Object.values(body ?? {}).some(value => value !== undefined),
    ),
};

type UpdateProfileBody = yup.InferType<
  typeof UserValidatorSchema.UpdateProfile
>;

export { UserValidatorSchema };
export type { UpdateProfileBody };
