"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { TemplateSubmission, TemplateSubmissionInput } from "@/lib/designer";
import {
  createTemplateSubmissionAction,
  submitTemplateSubmissionAction,
  updateTemplateSubmissionAction,
  uploadTemplateSourceAction,
} from "@/lib/designer";

type Props = { submission?: TemplateSubmission | null };

const inputCls = "w-full rounded-lg bg-surface px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50";
const labelCls = "text-[13px] font-medium text-ink-soft";

function SectionHeading({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/[0.08] text-accent-deep ring-1 ring-accent/10">
        <span aria-hidden="true" className="material-symbols-outlined text-[17px]">{icon}</span>
      </span>
      <div className="min-w-0">
        <h2 className="text-[14px] font-bold text-ink">{title}</h2>
        <p className="mt-0.5 text-[12px] font-medium text-ink-faint">{description}</p>
      </div>
    </div>
  );
}

export function SubmissionForm({ submission }: Props) {
  const t = useTranslations("Designer");
  const router = useRouter();
  const [form, setForm] = useState<TemplateSubmissionInput>({
    name: submission?.name ?? "",
    description: submission?.description ?? "",
    previewUrl: submission?.previewUrl ?? "",
    previewMobileUrl: submission?.previewMobileUrl ?? "",
    category: submission?.category ?? "other",
    tags: submission?.tags ?? [],
    licenseName: submission?.licenseName ?? "",
  });
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const locked = !!submission && !["draft", "revision_requested"].includes(submission.status);

  function update<K extends keyof TemplateSubmissionInput>(key: K, value: TemplateSubmissionInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
    setNotice(null);
  }

  async function ensureSaved(): Promise<string | null> {
    if (submission) {
      const result = await updateTemplateSubmissionAction(submission.id, form);
      if (!result.ok) {
        setError(result.error ?? "saveFailed");
        return null;
      }
      return submission.id;
    }

    const result = await createTemplateSubmissionAction(form);
    if (!result.ok || !result.submission) {
      setError(result.error ?? "saveFailed");
      return null;
    }
    return result.submission.id;
  }

  async function uploadSource(id: string): Promise<boolean> {
    if (!sourceFile) return true;
    const result = await uploadTemplateSourceAction(id, sourceFile);
    if (!result.ok) {
      setError(result.error ?? "uploadFailed");
      return false;
    }
    setSourceFile(null);
    return true;
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const id = await ensureSaved();
    if (id) {
      const uploaded = await uploadSource(id);
      if (uploaded) {
        setNotice(t("form.saved"));
        if (!submission) router.push(`/designer/submissions/${id}`);
      }
    }
    setSaving(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const id = await ensureSaved();
    if (id) {
      const uploaded = await uploadSource(id);
      if (uploaded) {
        const result = await submitTemplateSubmissionAction(id);
        if (!result.ok) setError(result.error ?? "submitFailed");
        else {
          setNotice(t("form.submitted"));
          router.push(`/designer/submissions/${id}`);
        }
      }
    }
    setSubmitting(false);
  }

  const disabled = saving || submitting || locked;

  return (
    <form onSubmit={handleSave} className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 pb-5 pt-6 sm:px-8">
        <Link href="/designer/submissions" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-soft transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_back</span>
          {t("backToSubmissions")}
        </Link>
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink sm:text-[28px]">{submission ? t("editSubmission") : t("newSubmission")}</h1>
        {submission && <p className="mt-1 text-sm text-ink-soft">{t(`statuses.${submission.status}`)}</p>}
      </header>

      <div className="flex-1 overflow-y-auto bg-canvas px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full rounded-2xl bg-surface shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col">
            {error && <div role="alert" className="mx-6 mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger sm:mx-8">{t(`errors.${error}` as never) || error}</div>}
            {notice && <div role="status" className="mx-6 mt-6 rounded-xl bg-positive/10 px-4 py-3 text-sm font-medium text-positive sm:mx-8">{notice}</div>}
            {locked && <div role="status" className="mx-6 mt-6 rounded-xl bg-info-soft px-4 py-3 text-sm font-medium text-info sm:mx-8">{t("form.locked")}</div>}

            <section className="px-6 py-8 sm:px-8">
              <SectionHeading icon="description" title={t("form.metadataTitle")} description={t("form.metadataDescription")} />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 md:col-span-2"><label htmlFor="submission-name" className={labelCls}>{t("form.name")}</label><input id="submission-name" disabled={locked} value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={80} placeholder={t("form.namePlaceholder")} className={inputCls} /></div>
                <div className="flex flex-col gap-1.5 md:col-span-2"><label htmlFor="submission-description" className={labelCls}>{t("form.description")}</label><textarea id="submission-description" disabled={locked} value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={1000} rows={5} placeholder={t("form.descriptionPlaceholder")} className={`${inputCls} resize-none`} /></div>
                <div className="flex flex-col gap-1.5"><label htmlFor="submission-category" className={labelCls}>{t("form.category")}</label><select id="submission-category" disabled={locked} value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>{(["minimal", "creative", "corporate", "developer", "agency", "other"] as const).map((category) => <option key={category} value={category}>{t(`categories.${category}`)}</option>)}</select></div>
                <div className="flex flex-col gap-1.5"><label htmlFor="submission-tags" className={labelCls}>{t("form.tags")}</label><input id="submission-tags" disabled={locked} value={form.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} placeholder={t("form.tagsPlaceholder")} className={inputCls} /></div>
              </div>
            </section>

            <section className="px-6 py-8 sm:px-8">
              <SectionHeading icon="visibility" title={t("form.previewTitle")} description={t("form.previewDescription")} />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5"><label htmlFor="submission-preview" className={labelCls}>{t("form.desktopPreview")}</label><input id="submission-preview" disabled={locked} type="url" value={form.previewUrl} onChange={(e) => update("previewUrl", e.target.value)} placeholder="https://..." className={inputCls} /></div>
                <div className="flex flex-col gap-1.5"><label htmlFor="submission-preview-mobile" className={labelCls}>{t("form.mobilePreview")}</label><input id="submission-preview-mobile" disabled={locked} type="url" value={form.previewMobileUrl} onChange={(e) => update("previewMobileUrl", e.target.value)} placeholder="https://... (optional)" className={inputCls} /></div>
              </div>
            </section>

            <section className="px-6 py-8 sm:px-8">
              <SectionHeading icon="inventory_2" title={t("form.sourceTitle")} description={t("form.sourceDescription")} />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 md:col-span-2"><label htmlFor="submission-source" className={labelCls}>{t("form.sourceFile")}</label><input id="submission-source" disabled={locked} type="file" accept=".zip,application/zip" onChange={(e) => setSourceFile(e.target.files?.[0] ?? null)} className="block w-full rounded-lg bg-surface px-4 py-3 text-sm font-normal text-ink ring-1 ring-black/10 file:mr-4 file:rounded-full file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-accent-deep disabled:opacity-60" /></div>
                {(sourceFile?.name || submission?.sourceFilename) && <p className="text-xs text-ink-soft md:col-span-2">{t("form.sourceSelected", { name: sourceFile?.name ?? submission?.sourceFilename ?? "" })}</p>}
                <div className="flex flex-col gap-1.5 md:col-span-2"><label htmlFor="submission-license" className={labelCls}>{t("form.license")}</label><input id="submission-license" disabled={locked} value={form.licenseName} onChange={(e) => update("licenseName", e.target.value)} placeholder={t("form.licensePlaceholder")} className={inputCls} /><p className="text-xs leading-5 text-ink-soft">{t("form.securityNote")}</p></div>
              </div>
            </section>

            <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-black/5 bg-surface/95 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-sm sm:px-6">
              <button type="submit" disabled={disabled} className="min-h-11 rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-black/10 transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50">{saving ? t("form.saving") : t("form.saveDraft")}</button>
              <button type="button" disabled={disabled} onClick={handleSubmit} className="min-h-11 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 active:scale-[0.98]">{submitting ? t("form.submitting") : t("form.submit")}</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
