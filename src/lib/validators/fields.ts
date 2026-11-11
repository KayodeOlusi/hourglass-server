import * as yup from "yup";

function isTimeZone(value?: string) {
  if (!value) return true;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function isLocale(value?: string) {
  if (!value) return true;
  try {
    return Intl.getCanonicalLocales(value).length === 1;
  } catch {
    return false;
  }
}

const fields = {
  timezone: () =>
    yup
      .string()
      .trim()
      .max(64)
      .test(
        "timezone",
        "${path} must be an IANA time zone, e.g. Africa/Lagos",
        isTimeZone,
      ),
  locale: () =>
    yup
      .string()
      .trim()
      .max(35)
      .test("locale", "${path} must be a locale, e.g. en or en-NG", isLocale),
};

export { fields };
