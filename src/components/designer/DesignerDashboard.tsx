"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { TemplateSubmission } from "@/lib/designer/types";

const STATUS_STYLES: Record<TemplateSubmission["status"], string> = {
  draft: "bg-black/[0.05] text-ink-soft",
  pending: "bg-amber-50 text-amber-700",
  revision_requested: "bg-sky-50 text-sky-700",
  approved: "bg-positive/10 text-positive",
  rejected: "bg-danger/10 text-danger",
};

export function DesignerDashboard({ submissions }: { submissions: TemplateSubmission[] }) {
  const t = useTranslations("Designer");
  const locale = useLocale();
  const count = (status: TemplateSubmission["status"]) => submissions.filter((item) => item.status === status).length;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 px-6 py-7 sm:px-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{t("eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{t("title")}</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">{t("subtitle")}</p>
        </div>
        <Link href="/designer/submissions/new" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(0,207,124,0.55)] transition-colors hover:bg-accent-deep">
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t("newSubmission")}
        </Link>
      </header>

      <div className="flex-1 space-y-8 p-6 sm:p-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(["draft", "pending", "revision_requested", "approved", "rejected"] as const).map((status) => (
            <div key={status} className="rounded-2xl bg-canvas p-4 ring-1 ring-black/5">
              <p className="text-xs font-semibold text-ink-soft">{t(`statuses.${status}`)}</p>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-ink">{count(status)}</p>
            </div>
          ))}
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">{t("recentTitle")}</h2>
              <p className="mt-1 text-sm text-ink-soft">{t("recentSubtitle")}</p>
            </div>
            <Link href="/designer/submissions" className="text-sm font-semibold text-accent hover:text-accent-deep">{t("viewAll")}</Link>
          </div>

          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-canvas px-6 py-14 text-center">
              <span className="material-symbols-outlined text-4xl text-accent/70">palette</span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{t("emptyTitle")}</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{t("emptyDescription")}</p>
              <Link href="/designer/submissions/new" className="mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-deep">{t("startSubmission")}</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5">
              <div className="divide-y divide-black/5">
                {submissions.slice(0, 8).map((submission) => (
                  <Link key={submission.id} href={`/designer/submissions/${submission.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-canvas sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{submission.name || t("untitled")}</p>
                      <p className="mt-1 text-xs text-ink-soft">{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(submission.updatedAt))}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[submission.status]}`}>{t(`statuses.${submission.status}`)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
