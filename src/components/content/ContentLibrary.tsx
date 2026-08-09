"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import {
  createContentItemAction,
  updateContentItemAction,
  deleteContentItemAction,
  updateContentItemStateAction,
} from "@/lib/content/actions";
import type { ContentItem, ContentType } from "@/lib/content/types";
import { LibraryImageUploadField } from "@/components/content/LibraryImageUploadField";

interface MetaField {
  key: string;
  year?: boolean;
}

// Per-type extra fields rendered in the add/edit modal. Keys map to the
// `content` JSON the templates and resolver expect (e.g. experience →
// company/role/startDate/endDate, education → institution/degree/field).
const META_FIELDS: Record<ContentType, MetaField[]> = {
  project: [],
  testimonial: [{ key: "role" }],
  certificate: [{ key: "issuer" }, { key: "date", year: true }],
  experience: [{ key: "company" }, { key: "role" }, { key: "startDate" }, { key: "endDate" }],
  education: [{ key: "institution" }, { key: "degree" }, { key: "field" }, { key: "startYear", year: true }, { key: "endYear", year: true }],
  publication: [{ key: "venue" }, { key: "year", year: true }],
  media: [{ key: "location" }, { key: "date", year: true }],
  caseStudy: [{ key: "category" }, { key: "date", year: true }],
  gallery: [{ key: "location" }, { key: "date", year: true }],
};

interface ItemForm {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  contentType: ContentType;
  meta: Record<string, string>;
}

const emptyMeta = (type: ContentType) =>
  Object.fromEntries(META_FIELDS[type].map((f) => [f.key, ""]));

const EMPTY_FORM: ItemForm = {
  title: "",
  description: "",
  imageUrl: "",
  link: "",
  contentType: "project",
  meta: {},
};

// All selectable content types — caseStudy/gallery stay usable here (in the
// type dropdown + pill rail) even though the dashboard sidebar only surfaces
// the seven primary types.
const CONTENT_TYPES: ContentType[] = [
  "project", "testimonial", "certificate",
  "experience", "education", "publication", "media",
  "caseStudy", "gallery",
];

const inputCls =
  "w-full rounded-lg bg-surface ring-1 ring-black/10 px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent transition-shadow";

export function ContentLibrary({
  initialItems,
  initialType = "project",
}: {
  initialItems: ContentItem[];
  initialType?: ContentType;
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
  const [activeType, setActiveType] = useState<ContentType>(initialType);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => item.contentType === activeType)
      .filter((item) =>
        q ? `${item.title} ${item.description}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items, activeType, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const type of CONTENT_TYPES) map[type] = items.filter((i) => i.contentType === type).length;
    return map;
  }, [items]);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, contentType: activeType, meta: emptyMeta(activeType) });
    setShowModal(true);
  }

  function openEdit(item: ContentItem) {
    setEditing(item);
    const meta: Record<string, string> = {};
    for (const field of META_FIELDS[item.contentType]) {
      const v = item.content[field.key];
      meta[field.key] = v === undefined || v === null ? "" : String(v);
    }
    setForm({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      link: item.link,
      contentType: item.contentType,
      meta,
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
    const content: Record<string, unknown> = {};
    for (const field of META_FIELDS[form.contentType]) {
      const raw = (form.meta[field.key] ?? "").trim();
      const isEducationYear =
        form.contentType === "education" &&
        (field.key === "startYear" || field.key === "endYear");
      content[field.key] = isEducationYear ? (raw ? Number(raw) : "") : raw;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
      link: form.link.trim(),
      contentType: form.contentType,
      isActive: editing?.isActive ?? true,
      content,
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
        const res = await createContentItemAction(payload);
        if (res.ok && res.item) {
          setItems((prev) => [res.item!, ...prev]);
          setActiveType(res.item.contentType);
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

  async function updateState(item: ContentItem, isActive: boolean, sortOrder: number) {
    const res = await updateContentItemStateAction(item.id, isActive, sortOrder);
    if (!res.ok) return showToast(t("saveError"), "error");
    setItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, isActive, sortOrder } : entry));
  }

  async function move(item: ContentItem, direction: -1 | 1) {
    const typed = items.filter((entry) => entry.contentType === item.contentType).sort((a, b) => a.sortOrder - b.sortOrder);
    const index = typed.findIndex((entry) => entry.id === item.id);
    const target = typed[index + direction];
    if (!target) return;
    await Promise.all([updateState(item, item.isActive, target.sortOrder), updateState(target, target.isActive, item.sortOrder)]);
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

  const metaFields = META_FIELDS[form.contentType];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="shrink-0 border-b border-black/5 bg-white px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-ink">{t("title")}</h1>
            <p className="mt-1 text-[12.5px] font-medium text-ink-soft">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full bg-accent px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-accent-deep active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            {t("addItem")}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <nav
            className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-black/[0.045] p-1"
            aria-label={t("typesLabel")}
          >
            {CONTENT_TYPES.map((type) => {
              const active = activeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "bg-surface text-ink shadow-sm ring-1 ring-black/5" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {t(`types.${type}`)}
                  <span className={`ml-1.5 text-[11px] font-bold ${active ? "text-accent" : "text-ink-faint"}`}>
                    {counts[type]}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="relative w-full max-w-[260px]">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-ink-faint">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full bg-shell py-1.5 pl-8 pr-3 text-xs font-medium text-ink placeholder:text-ink-faint ring-1 ring-transparent focus:outline-none focus:bg-surface focus:ring-black/10 transition-shadow"
            />
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto bg-shell/40 px-6 py-6 sm:px-8">
        {filtered.length === 0 ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3.5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-tint ring-1 ring-accent/20">
              <span className="material-symbols-outlined text-[26px] text-accent-deep">
                {query ? "search_off" : "folder_open"}
              </span>
            </div>
            <p className="text-[15px] font-bold text-ink">{query ? t("searchEmptyTitle") : t("emptyTitle")}</p>
            <p className="max-w-sm text-[12.5px] leading-relaxed text-ink-soft">
              {query ? t("searchEmptyDesc") : t("emptyDesc")}
            </p>
            {!query && (
              <button
                type="button"
                onClick={openNew}
                className="mt-1.5 rounded-full bg-accent px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-deep active:scale-[0.98]"
              >
                {t("addItem")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-black/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-shell">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="material-symbols-outlined text-[30px] text-ink-faint/70">image</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 truncate text-[14px] font-semibold text-ink">
                      {item.title || t("untitled")}
                    </h3>
                    <button
                      type="button"
                      aria-label={item.isActive ? t("madeActive") : t("madeInactive")}
                      onClick={() => updateState(item, !item.isActive, item.sortOrder)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                        item.isActive ? "bg-accent-tint text-accent-deep" : "bg-shell text-ink-faint hover:text-ink-soft"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {item.isActive ? "check_circle" : "visibility_off"}
                      </span>
                    </button>
                  </div>

                  {item.description && (
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-ink-soft">
                      {item.description}
                    </p>
                  )}

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex w-max items-center gap-1 text-[11px] font-semibold text-accent-deep hover:underline"
                    >
                      {t("openLink")}
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                      item.isActive ? "bg-accent-tint text-accent-deep" : "bg-shell text-ink-faint"
                    }`}>
                      {item.isActive ? t("active") : t("inactive")}
                    </span>

                    <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <button type="button" aria-label={t("moveUp")} onClick={() => move(item, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-shell hover:text-ink">
                        <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                      </button>
                      <button type="button" aria-label={t("moveDown")} onClick={() => move(item, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-shell hover:text-ink">
                        <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
                      </button>
                      <button type="button" aria-label={t("edit")} onClick={() => openEdit(item)} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-shell hover:text-ink">
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button
                        type="button"
                        aria-label={t("delete")}
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
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
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-surface p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-ink">
                  {editing ? t("editTitle") : t("addTitle")}
                </h3>
                <p className="mt-1 text-[12.5px] text-ink-soft">{t("modalHint")}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label={t("cancel")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-shell hover:text-ink"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-semibold text-ink-soft">{t("typeLabel")}</span>
                  <select
                    value={form.contentType}
                    onChange={(e) => {
                      const type = e.target.value as ContentType;
                      setForm((f) => ({ ...f, contentType: type, meta: emptyMeta(type) }));
                    }}
                    className={inputCls}
                  >
                    {CONTENT_TYPES.map((type) => <option key={type} value={type}>{t(`types.${type}`)}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-semibold text-ink-soft">{t("titleLabel")}</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={t("titlePlaceholder")}
                    className={inputCls}
                  />
                </label>
              </div>

              {metaFields.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {metaFields.map((field) => (
                    <label key={field.key} className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-semibold text-ink-soft">
                        {t(`metaLabels.${field.key}`)}
                      </span>
                      <input
                        value={form.meta[field.key] ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, meta: { ...f.meta, [field.key]: e.target.value } }))
                        }
                        placeholder={field.year ? "2026" : undefined}
                        className={inputCls}
                      />
                    </label>
                  ))}
                </div>
              )}

              <LibraryImageUploadField
                label={t("imageLabel")}
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url ?? "" }))}
                onError={() => showToast(t("imageUploadError"), "error")}
                uploadLabel={t("imageUpload")}
                replaceLabel={t("imageReplace")}
                removeLabel={t("imageRemove")}
              />

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-ink-soft">{t("descLabel")}</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder={t("descPlaceholder")}
                  className={`${inputCls} resize-none`}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-ink-soft">{t("linkLabel")}</span>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="https://…"
                  className={inputCls}
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 border-t border-black/5 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft ring-1 ring-black/10 transition-colors hover:bg-shell hover:text-ink"
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