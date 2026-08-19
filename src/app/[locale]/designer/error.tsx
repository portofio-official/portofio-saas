"use client";

import { useTranslations } from "next-intl";

export default function DesignerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("Designer");

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-canvas p-6 sm:p-8">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-black/5 sm:p-10">
        <span aria-hidden="true" className="material-symbols-outlined text-4xl text-danger">error</span>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">{t("loadErrorTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{t("loadErrorDescription")}</p>
        <button type="button" onClick={reset} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98]">
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
