import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { listTemplateSubmissions } from "@/lib/designer/store";

export default async function DesignerSubmissionsPage() {
  const [submissions, t] = await Promise.all([listTemplateSubmissions(), getTranslations("Designer")]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 pb-5 pt-6 sm:px-8">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-deep ring-1 ring-accent/20"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{t("eyebrow")}</span>
          <h1 className="mt-2.5 font-display text-[24px] font-bold tracking-tight text-ink sm:text-[28px]">{t("submissionsTitle")}</h1>
        </div>
        <Link href="/designer/submissions/new" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-accent-deep active:scale-[0.98]"><span className="material-symbols-outlined text-[17px]">add</span>{t("newSubmission")}</Link>
      </header>
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-canvas px-6 py-14 text-center text-sm text-ink-soft">{t("emptyDescription")}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {submissions.map((submission) => (
              <Link key={submission.id} href={`/designer/submissions/${submission.id}`} className="rounded-2xl bg-surface p-5 ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:ring-accent/30 hover:shadow-[var(--shadow-diffused)]">
                <div className="flex items-start justify-between gap-3"><h2 className="font-display text-lg font-bold text-ink">{submission.name || t("untitled")}</h2><span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-bold text-ink-soft">{t(`statuses.${submission.status}`)}</span></div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-soft">{submission.description || t("noDescription")}</p>
                <p className="mt-5 text-xs font-medium text-ink-faint">{new Date(submission.updatedAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
