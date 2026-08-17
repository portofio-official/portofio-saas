"use client";

import React, { useState } from "react";
import { addBlocklistWordAction, removeBlocklistWordAction } from "@/lib/admin";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "next-intl";

interface BlocklistClientViewProps {
  initialBlocklist: string[];
}

export function BlocklistClientView({ initialBlocklist }: BlocklistClientViewProps) {
  const t = useTranslations("Admin");
  const [list, setList] = useState<string[]>(initialBlocklist);
  const [newSlug, setNewSlug] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Inline confirmation instead of window.confirm()
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const { showToast } = useToast();

  const filteredList = list.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase().trim()),
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlug.trim()) return;

    setLoading(true);
    setError(null);

    const res = await addBlocklistWordAction(newSlug);
    setLoading(false);

    if (res.ok) {
      const slug = newSlug.toLowerCase().trim();
      setList((prev) => [...prev, slug].sort());
      setNewSlug("");
      showToast(t("blocklist.addedToast", { slug }), "success");
    } else {
      setError(res.error ?? t("blocklist.addFailed"));
    }
  }

  async function handleRemove(slug: string) {
    setLoading(true);
    setError(null);
    setConfirmSlug(null);

    const res = await removeBlocklistWordAction(slug);
    setLoading(false);

    if (res.ok) {
      setList((prev) => prev.filter((item) => item !== slug));
      showToast(t("blocklist.removedToast", { slug }), "info");
    } else {
      setError(res.error ?? t("blocklist.removeFailed"));
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header & Controls Card */}
        <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="font-display text-[17px] font-bold text-ink">{t("blocklist.addTitle")}</h2>
          <p className="mt-1 mb-4 text-[13px] font-medium text-ink-soft">
            {t("blocklist.addSubtitle")}
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-danger/10 p-3 text-sm font-medium text-danger ring-1 ring-danger/20">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder={t("blocklist.addPlaceholder")}
              className="flex-1 rounded-lg bg-surface px-4 py-2.5 text-sm text-ink ring-1 ring-black/10 placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newSlug.trim()}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-deep active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? t("blocklist.adding") : t("blocklist.addButton")}
            </button>
          </form>
        </div>

        {/* List Card */}
        <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-[15px] font-bold text-ink">
              {t("blocklist.listTitle")} ({filteredList.length})
            </h3>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("blocklist.searchPlaceholder")}
              className="rounded-lg bg-surface px-3 py-1.5 text-sm text-ink ring-1 ring-black/10 placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredList.map((slug) => (
              <div
                key={slug}
                className="group flex items-center gap-1.5 rounded-full bg-ink/[0.05] px-3 py-1 text-xs font-medium text-ink ring-1 ring-black/5 transition hover:bg-ink/[0.08]"
              >
                <span>{slug}</span>
                {confirmSlug === slug ? (
                  <span className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => handleRemove(slug)}
                      disabled={loading}
                      className="rounded-full px-3 py-1.5 text-[11px] font-bold bg-danger text-white hover:bg-danger/90 active:bg-danger/80 disabled:opacity-50"
                    >
                      {t("users.yes")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSlug(null)}
                      className="rounded-full px-3 py-1.5 text-[11px] font-bold bg-black/5 text-ink hover:bg-black/10 active:bg-black/15"
                    >
                      {t("users.cancel")}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSlug(slug)}
                    title={`${t("blocklist.remove")} ${slug}`}
                    aria-label={`${t("blocklist.remove")} ${slug}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger active:bg-danger/15 active:text-danger"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {filteredList.length === 0 && (
            <p className="text-center py-6 text-sm font-medium text-ink-soft">
              {t("blocklist.emptySearch", { search })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}