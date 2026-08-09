import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import en from "../../messages/en.json";
import id from "../../messages/id.json";

const messages = { en, id } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Static imports instead of a dynamic `import(...)` so Turbopack dev does
    // not cache an older copy of the JSON when messages/*.json changes.
    messages: messages[locale],
  };
});