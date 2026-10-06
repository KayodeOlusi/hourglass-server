import * as yup from "yup";

const AuthValidatorSchema = {
  SignIn: yup.object({
    id_token: yup.string().required(),
    nonce: yup.string().optional(),
    first_name: yup.string().trim().optional(),
    last_name: yup.string().trim().optional(),
    device: yup
      .object({
        platform: yup.string().oneOf(["ios", "android"] as const).required(),
        device_token: yup.string().optional(),
        device_name: yup.string().optional(),
        app_version: yup.string().optional(),
        os_version: yup.string().optional(),
      })
      .required(),
  }),
  Refresh: yup.object({
    refresh_token: yup.string().required(),
  }),
};

type SignInBody = yup.InferType<typeof AuthValidatorSchema.SignIn>;
type RefreshBody = yup.InferType<typeof AuthValidatorSchema.Refresh>;

export { AuthValidatorSchema };
export type { SignInBody, RefreshBody };
