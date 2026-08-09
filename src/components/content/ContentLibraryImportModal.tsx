"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { listContentItemsAction } from "@/lib/content/actions";
import type { ContentItem } from "@/lib/content/types";

export interface ImportedProject {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

export function ContentLibraryImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (items: ImportedProject[]) => void;
}) {
  const t = useTranslations("ContentLibrary");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listContentItemsAction()
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        if (!cancelled) setError("loadError");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayError = error;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function doImport() {
    const chosen = items.filter((it) => selected.has(it.id));
    if (chosen.length === 0) return;
    onImport(
      chosen.map((it) => ({
        title: it.title,
        description: it.description,
        imageUrl: it.imageUrl,
        link: it.link,
      })),
    );
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-floating ring-1 ring-black/5">
        <div className="flex items-start justify-between border-b border-black/5 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-ink">{t("pickTitle")}</h3>
            <p className="mt-0.5 text-sm text-ink-soft">{t("pickHint")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-ink-soft">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
              {t("loading")}
            </div>
          ) : displayError ? (
            <p className="py-10 text-center text-sm text-danger">{t(displayError)}</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="material-symbols-outlined text-[36px] text-ink-faint">folder_open</span>
              <p className="text-sm font-semibold text-ink">{t("emptyTitle")}</p>
              <p className="max-w-sm text-[13px] text-ink-soft">{t("pickEmpty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={`flex gap-3 rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                  >
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/[0.04]">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-ink-faint">image</span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-bold text-ink">
                        {item.title || t("untitled")}
                      </span>
                      {item.description && (
                        <span className="line-clamp-2 text-[11px] leading-snug text-ink-soft">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isSelected ? "text-accent" : "text-ink-faint"
                      }`}
                    >
                      {isSelected ? "check_circle" : "circle"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-black/5 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={selected.size === 0 && items.length > 0}
            onClick={doImport}
            className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            {t("import", { count: selected.size })}
          </button>
        </div>
      </div>
    </div>
  );
}
