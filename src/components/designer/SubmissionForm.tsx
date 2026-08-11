"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { TemplateSubmission, TemplateSubmissionInput } from "@/lib/designer/types";
import {
  createTemplateSubmissionAction,
  submitTemplateSubmissionAction,
  updateTemplateSubmissionAction,
  uploadTemplateSourceAction,
} from "@/lib/designer/actions";

type Props = { submission?: TemplateSubmission | null };

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
        if (!result.ok) {
          setError(result.error ?? "submitFailed");
        } else {
          setNotice(t("form.submitted"));
          router.push(`/designer/submissions/${id}`);
        }
      }
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSave} className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 px-6 py-6 sm:px-10">
        <div>
          <Link href="/designer/submissions" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink"><span className="material-symbols-outlined text-[16px]">arrow_back</span>{t("backToSubmissions")}</Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{submission ? t("editSubmission") : t("newSubmission")}</h1>
          {submission && <p className="mt-1 text-sm text-ink-soft">{t(`statuses.${submission.status}`)}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="submit" disabled={saving || submitting || locked} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5 disabled:opacity-50">{saving ? t("form.saving") : t("form.saveDraft")}</button>
          <button type="button" disabled={saving || submitting || locked} onClick={handleSubmit} className="rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-deep disabled:opacity-50">{submitting ? t("form.submitting") : t("form.submit")}</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-canvas p-6 sm:p-10">
        <div className="mx-auto max-w-3xl space-y-5">
          {error && <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{t(`errors.${error}` as never) || error}</div>}
          {notice && <div className="rounded-xl bg-positive/10 px-4 py-3 text-sm font-medium text-positive">{notice}</div>}
          {locked && <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">{t("form.locked")}</div>}

          <section className="rounded-2xl bg-surface p-5 ring-1 ring-black/5 sm:p-7">
            <h2 className="font-display text-lg font-bold text-ink">{t("form.metadataTitle")}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t("form.metadataDescription")}</p>
            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-ink">{t("form.name")}
                <input disabled={locked} value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={80} placeholder={t("form.namePlaceholder")} className="h-11 rounded-xl bg-canvas px-4 font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent disabled:opacity-60" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink">{t("form.description")}
                <textarea disabled={locked} value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={1000} rows={5} placeholder={t("form.descriptionPlaceholder")} className="rounded-xl bg-canvas px-4 py-3 font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent disabled:opacity-60" />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-ink">{t("form.category")}
                  <select disabled={locked} value={form.category} onChange={(e) => update("category", e.target.value)} className="h-11 rounded-xl bg-canvas px-4 font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent disabled:opacity-60">
                    {(["minimal", "creative", "corporate", "developer", "agency", "other"] as const).map((category) => <option key={category} value={category}>{t(`categories.${category}`)}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink">{t("form.tags")}
                  <input disabled={locked} value={form.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} placeholder={t("form.tagsPlaceholder")} className="h-11 rounded-xl bg-canvas px-4 font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent disabled:opacity-60" />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-surface p-5 ring-1 ring-black/5 sm:p-7">
            <h2 className="font-display text-lg font-bold text-ink">{t("form.previewTitle")}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t("form.previewDescription")}</p>
            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-ink">{t("form.desktopPreview")}
                <input disabled={locked} type="url" value={form.previewUrl} onChange={(e) => update("previewUrl", e.target.value)} placeholder="https://..." className="h-11 rounded-xl bg-canvas px-4 font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent disabled:opacity-60" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink">{t("form.mobilePreview")}
                <input disabled={locked} type="url" value={form.previewMobileUrl} onChange={(e) => update("previewMobileUrl", e.target.value)} placeholder="https://... (optional)" className="h-11 rounded-xl bg-canvas px-4 font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent disabled:opacity-60" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-surface p-5 ring-1 ring-black/5 sm:p-7">
            <h2 className="font-display text-lg font-bold text-ink">{t("form.sourceTitle")}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t("form.sourceDescription")}</p>
            <label className="mt-6 grid gap-2 text-sm font-semibold text-ink">{t("form.sourceFile")}
              <input disabled={locked} type="file" accept=".zip,application/zip" onChange={(e) => setSourceFile(e.target.files?.[0] ?? null)} className="block w-full rounded-xl bg-canvas px-4 py-3 text-sm font-normal ring-1 ring-black/10 file:mr-4 file:rounded-full file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-accent-deep disabled:opacity-60" />
            </label>
            {(sourceFile?.name || submission?.sourceFilename) && <p className="mt-3 text-xs text-ink-soft">{t("form.sourceSelected", { name: sourceFile?.name ?? submission?.sourceFilename ?? "" })}</p>}
            <label className="mt-5 grid gap-2 text-sm font-semibold text-ink">{t("form.license")}
              <input disabled={locked} value={form.licenseName} onChange={(e) => update("licenseName", e.target.value)} placeholder={t("form.licensePlaceholder")} className="h-11 rounded-xl bg-canvas px-4 font-normal outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-accent disabled:opacity-60" />
            </label>
            <p className="mt-3 text-xs leading-5 text-ink-faint">{t("form.securityNote")}</p>
          </section>
        </div>
      </div>
    </form>
  );
}
