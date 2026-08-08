"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import {
  createContentItemAction,
  updateContentItemAction,
  deleteContentItemAction,
} from "@/lib/content/actions";
import type { ContentItem } from "@/lib/content/types";
import { LibraryImageUploadField } from "@/components/content/LibraryImageUploadField";

interface ItemForm {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const EMPTY_FORM: ItemForm = { title: "", description: "", imageUrl: "", link: "" };

export function ContentLibrary({
  workspaceId,
  workspaceName,
  initialItems,
}: {
  workspaceId: string;
  workspaceName: string;
  initialItems: ContentItem[];
}) {
  const t = useTranslations("ContentLibrary");
  const router = useRouter();
  const { showToast } = useToast();

  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(item: ContentItem) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      link: item.link,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (saving) return;
    if (!form.title.trim()) {
      showToast(t("titleRequired"), "error");
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
      link: form.link.trim(),
    };
    try {
      let saved = false;
      if (editing) {
        const res = await updateContentItemAction(editing.id, payload);
        if (res.ok) {
          setItems((prev) =>
            prev.map((it) => (it.id === editing.id ? { ...it, ...payload } : it)),
          );
          showToast(t("saved"), "success");
          saved = true;
        } else {
          showToast(res.error ?? t("saveError"), "error");
        }
      } else {
        const res = await createContentItemAction(workspaceId, payload);
        if (res.ok && res.item) {
          setItems((prev) => [res.item!, ...prev]);
          showToast(t("created"), "success");
          saved = true;
        } else {
          showToast(res.error ?? t("saveError"), "error");
        }
      }
      if (saved) {
        setShowModal(false);
        router.refresh();
      }
    } catch {
      showToast(t("saveError"), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: ContentItem) {
    if (deletingId) return;
    setDeletingId(item.id);
    try {
      const res = await deleteContentItemAction(item.id);
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        showToast(t("deleted"), "success");
        router.refresh();
      } else {
        showToast(res.error ?? t("deleteError"), "error");
      }
    } catch {
      showToast(t("deleteError"), "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b border-[#E5E7EB] bg-white px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#111827]">
              {t("title")}
            </h1>
            <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
              {t("subtitle")} · <span className="text-[#059669]">{workspaceName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="flex h-9 items-center gap-2 rounded-xl bg-[#00cf7c] hover:bg-[#00b368] px-4 text-[13px] font-bold text-white shadow-[0_4px_14px_0_rgba(0,207,124,0.35)] transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t("addItem")}
          </button>
        </div>
        <p className="text-[12px] text-[#6B7280]">{t("hint")}</p>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <span className="material-symbols-outlined text-[36px] text-[#9CA3AF]">
              folder_open
            </span>
            <p className="text-[16px] font-semibold text-[#111827]">{t("emptyTitle")}</p>
            <p className="max-w-sm text-[13px] text-[#6B7280]">{t("emptyDesc")}</p>
            <button
              type="button"
              onClick={openNew}
              className="mt-2 rounded-xl bg-[#00cf7c] hover:bg-[#00b368] px-4 py-2 text-[13px] font-bold text-white transition-colors"
            >
              {t("addItem")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#D1D5DB] hover:shadow-md"
              >
                <div className="flex h-36 items-center justify-center overflow-hidden bg-[#F9FAFB]">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[28px] text-[#C0C8D4]">
                      image
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="truncate text-[14px] font-semibold text-[#111827]">
                    {item.title || t("untitled")}
                  </p>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[#6B7280]">
                      {item.description}
                    </p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex w-max items-center gap-1 text-[11px] font-semibold text-[#00b368] hover:underline"
                    >
                      {t("openLink")}
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  )}
                  <div className="mt-auto flex items-center gap-1 pt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-[#DC2626] hover:bg-[#FFEFEE] transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {editing ? t("editTitle") : t("addTitle")}
                </h3>
                <p className="mt-1 text-sm text-ink-soft">{t("modalHint")}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
              <LibraryImageUploadField
                label={t("imageLabel")}
                value={form.imageUrl}
                workspaceId={workspaceId}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url ?? "" }))}
                onError={() => showToast(t("imageUploadError"), "error")}
                uploadLabel={t("imageUpload")}
                replaceLabel={t("imageReplace")}
                removeLabel={t("imageRemove")}
              />
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-soft">{t("titleLabel")}</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t("titlePlaceholder")}
                  className="rounded-lg bg-surface ring-1 ring-black/10 px-4 py-2.5 text-[13px] font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-soft">{t("descLabel")}</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder={t("descPlaceholder")}
                  className="resize-none rounded-lg bg-surface ring-1 ring-black/10 px-4 py-2.5 text-[13px] font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-soft">{t("linkLabel")}</span>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="https://…"
                  className="rounded-lg bg-surface ring-1 ring-black/10 px-4 py-2.5 text-[13px] font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-deep disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {t("saving")}
                  </>
                ) : (
                  t("save")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
