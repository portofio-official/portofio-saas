import { getCountries, getCountryCallingCode } from "libphonenumber-js";

export interface CountryInfo {
  iso: string;
  code: string;
  nameEn: string;
  nameId: string;
}

const NAME_EN = new Intl.DisplayNames(["en"], { type: "region" });
const NAME_ID = new Intl.DisplayNames(["id"], { type: "region" });

const ALL: CountryInfo[] = getCountries()
  .map((iso) => ({
    iso,
    code: getCountryCallingCode(iso),
    nameEn: NAME_EN.of(iso) || iso,
    nameId: NAME_ID.of(iso) || NAME_EN.of(iso) || iso,
  }))
  .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

const BY: { en: CountryInfo[]; id: CountryInfo[] } = {
  en: ALL,
  id: [...ALL].sort((a, b) => a.nameId.localeCompare(b.nameId)),
};

function normalizeLocale(locale: string): "en" | "id" {
  return locale === "id" ? "id" : "en";
}

export function countriesByLocale(locale: string): CountryInfo[] {
  return BY[normalizeLocale(locale)];
}

export function flagEmoji(iso: string): string {
  const code = iso.toUpperCase();
  if (code.length !== 2) return "🌐";
  return code.replace(
    /./g,
    (c) => String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

/** Longest-prefix country lookup from a bare dial string (e.g. "62" -> ID). */
export function matchCountryByLeadingDigits(
  raw: string
): CountryInfo | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 2) return null;
  let match: CountryInfo | null = null;
  for (let len = digits.length; len > 0; len--) {
    const prefix = digits.slice(0, len);
    const found = ALL.find((c) => c.code === prefix);
    if (found) {
      match = found;
      break;
    }
  }
  return match;
}

export function countryByIso(iso: string): CountryInfo | null {
  return ALL.find((c) => c.iso === iso) || null;
}