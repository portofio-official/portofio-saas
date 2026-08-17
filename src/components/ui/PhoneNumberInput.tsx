"use client";

import { useMemo, useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  countriesByLocale,
  countryByIso,
  flagEmoji,
  matchCountryByLeadingDigits,
} from "@/lib/phone";

interface PhoneNumberInputProps {
  /** Canonical international number, e.g. "+62 812 3456 7890" or raw digits. */
  value: string;
  onChange: (value: string) => void;
  locale: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  countrySearch?: string;
  noCountryHint?: string;
}

function resolveInitial(value: string, fallbackIso: string) {
  const raw = (value ?? "").trim();
  if (!raw) return { iso: fallbackIso, field: "" };

  const digits = raw.replace(/\D/g, "");
  if (!digits.length) return { iso: fallbackIso, field: raw };

  if (raw.startsWith("+")) {
    try {
      const parsed = parsePhoneNumberFromString(raw);
      if (parsed?.country) return { iso: parsed.country, field: parsed.nationalNumber };
    } catch {
      /* falls through to prefix match */
    }
    const matched = matchCountryByLeadingDigits(raw);
    return { iso: matched?.iso || fallbackIso, field: digits };
  }

  return { iso: fallbackIso, field: digits };
}

function canonical(iso: string, digitsRaw: string): string {
  const info = countryByIso(iso);
  const digits = digitsRaw.replace(/\D/g, "").replace(/^0+/, "");
  if (!info) return digits;
  if (!digits.length) return "";
  return `+${info.code} ${digits}`;
}

export function PhoneNumberInput({
  value,
  onChange,
  locale,
  id,
  disabled,
  placeholder,
  countrySearch,
  noCountryHint,
}: PhoneNumberInputProps) {
  const initial = useMemo(() => resolveInitial(value, "ID"), [value]);
  const [iso, setIso] = useState<string>(initial.iso);
  const [field, setField] = useState<string>(initial.field);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const countries = useMemo(() => countriesByLocale(locale), [locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameId.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [countries, query]);

  const active = countryByIso(iso);

  const handleFieldChange = (text: string) => {
    setField(text);
    const t = text.trim();
    if (!t) {
      onChange("");
      return;
    }

    const startsPlus = t.startsWith("+");
    const digits = t.replace(/\D/g, "");

    if (startsPlus) {
      try {
        const parsed = parsePhoneNumberFromString(t);
        if (parsed?.country) {
          setIso(parsed.country);
          if (parsed.nationalNumber !== text) setField(parsed.nationalNumber);
          onChange(canonical(parsed.country, parsed.nationalNumber));
          return;
        }
      } catch {
        /* not parseable yet — try a bare prefix match */
      }
      const matched = matchCountryByLeadingDigits(digits);
      if (matched) setIso(matched.iso);
      onChange(`+${digits}`);
      return;
    }

    onChange(canonical(iso, digits));
  };

  const handleSelectIso = (next: string) => {
    const digitsFromField = field.replace(/\D/g, "");
    const t = field.trim();
    let natDigits = digitsFromField;
    if (t.startsWith("+")) {
      try {
        const parsed = parsePhoneNumberFromString(t);
        if (parsed?.nationalNumber) natDigits = parsed.nationalNumber;
      } catch {
        const old = countryByIso(iso);
        if (old && natDigits.startsWith(old.code)) {
          natDigits = natDigits.slice(old.code.length);
        }
      }
    }
    setIso(next);
    setField(natDigits);
    setOpen(false);
    setQuery("");
    onChange(canonical(next, natDigits));
  };

  return (
    <div className="relative flex items-stretch gap-2">
      <div className="relative shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-full items-center gap-1.5 rounded-lg bg-surface px-2.5 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50"
        >
          <span aria-hidden className="text-base leading-none">
            {active ? flagEmoji(active.iso) : "🌐"}
          </span>
          <span className="font-mono text-[13px] text-ink-soft">
            {active ? `+${active.code}` : "+·"}
          </span>
          <span className="material-symbols-outlined text-[16px] text-ink-faint">
            {open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          </span>
        </button>

        {open && (
          <div className="absolute left-0 top-full z-30 mt-2 flex max-h-80 w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl bg-surface shadow-floating ring-1 ring-black/10">
            <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2.5">
              <span className="material-symbols-outlined text-[16px] text-ink-faint">
                search
              </span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={countrySearch}
                className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
              {filtered.map((c) => (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.iso === iso}
                    onClick={() => handleSelectIso(c.iso)}
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors ${
                      c.iso === iso
                        ? "bg-accent/10 font-semibold text-ink"
                        : "text-ink hover:bg-black/[0.03]"
                    }`}
                  >
                    <span aria-hidden>{flagEmoji(c.iso)}</span>
                    <span className="flex-1 truncate">
                      {locale === "id" ? c.nameId : c.nameEn}
                    </span>
                    <span className="font-mono text-[12px] text-ink-faint">
                      +{c.code}
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-3 text-[12px] text-ink-faint">
                  {noCountryHint}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        disabled={disabled}
        value={field}
        onChange={(e) => handleFieldChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 flex-1 rounded-lg bg-surface px-4 py-3 text-[16px] text-ink placeholder:text-ink-faint ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50"
      />
    </div>
  );
}