"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { TemplateSubmission } from "@/lib/designer";

const STATUS_STYLES: Record<TemplateSubmission["status"], string> = {
  draft: "bg-black/[0.05] text-ink-soft",
  pending: "bg-warning-soft text-warning",
  revision_requested: "bg-info-soft text-info",
  approved: "bg-positive/10 text-positive",
  rejected: "bg-danger/10 text-danger",
};

export function DesignerDashboard({ submissions }: { submissions: TemplateSubmission[] }) {
  const t = useTranslations("Designer");
  const locale = useLocale();
  const count = (status: TemplateSubmission["status"]) => submissions.filter((item) => item.status === status).length;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 pb-5 pt-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-deep ring-1 ring-accent/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("eyebrow")}
            </span>
            <h1 className="mt-2.5 font-display text-[24px] font-bold tracking-tight text-ink sm:text-[28px]">{t("title")}</h1>
            <p className="mt-1 text-sm font-medium text-ink-soft">{t("subtitle")}</p>
          </div>
          <span className="hidden text-xs font-medium text-ink-faint sm:block">{submissions.length} {t("submissions")}</span>
          <Link href="/designer/submissions/new" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-accent-deep active:scale-[0.98]">
            <span className="material-symbols-outlined text-[17px]">add</span>
            {t("newSubmission")}
          </Link>
        </div>
      </header>

      <div className="flex-1 space-y-8 overflow-y-auto p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(["draft", "pending", "revision_requested", "approved", "rejected"] as const).map((status) => (
            <div key={status} className="rounded-[1.35rem] bg-black/[0.025] p-1.5 ring-1 ring-black/5">
              <div className="h-full rounded-xl bg-surface p-5 shadow-sm ring-1 ring-black/5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs font-semibold text-ink-soft">{t(`statuses.${status}`)}</p>
                <p className="mt-3 font-mono text-3xl font-bold tabular-nums tracking-tight text-ink">{count(status)}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="rounded-[1.35rem] bg-black/[0.025] p-1.5 ring-1 ring-black/5">
          <div className="rounded-xl bg-surface p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">{t("recentTitle")}</h2>
              <p className="mt-1 text-sm text-ink-soft">{t("recentSubtitle")}</p>
            </div>
            <Link href="/designer/submissions" className="text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">{t("viewAll")}</Link>
          </div>

          {submissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 bg-canvas px-6 py-14 text-center">
              <span className="material-symbols-outlined text-4xl text-accent/70">palette</span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{t("emptyTitle")}</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{t("emptyDescription")}</p>
              <Link href="/designer/submissions/new" className="mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-deep active:scale-[0.98]">{t("startSubmission")}</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-canvas ring-1 ring-black/5">
              <div className="divide-y divide-black/5">
                {submissions.slice(0, 8).map((submission) => (
                  <Link key={submission.id} href={`/designer/submissions/${submission.id}`} className="group flex items-center justify-between gap-4 px-5 py-4 transition-[background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-surface sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{submission.name || t("untitled")}</p>
                      <p className="mt-1 text-xs text-ink-soft">{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(submission.updatedAt))}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[submission.status]}`}>{t(`statuses.${submission.status}`)}</span>
                      <span className="material-symbols-outlined text-[17px] text-ink-faint transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">arrow_forward</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}
