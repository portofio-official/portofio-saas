"use client";

import React, { useState } from "react";
import { addBlocklistWordAction, removeBlocklistWordAction } from "@/lib/admin";
import { useToast } from "@/components/ui/Toast";
import { useTranslations } from "next-intl";
import { X } from "@phosphor-icons/react/dist/ssr";
import { AdminCard } from "@/components/admin/primitives";

interface BlocklistClientViewProps {
  initialBlocklist: string[];
}

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary";

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
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Add form */}
        <AdminCard className="p-6">
          <h2 className="font-display text-[15px] font-bold text-admin-ink">{t("blocklist.addTitle")}</h2>
          <p className="mb-4 mt-1 text-[13px] text-admin-ink-soft">{t("blocklist.addSubtitle")}</p>

          {error && (
            <div className="mb-4 rounded-admin-sm bg-admin-rose-tint p-3 text-sm font-medium text-admin-rose">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder={t("blocklist.addPlaceholder")}
              className={`h-11 flex-1 rounded-admin-sm border border-admin-border px-4 font-mono text-sm text-admin-ink outline-none placeholder:font-sans placeholder:text-admin-ink-faint disabled:opacity-50 ${FOCUS_RING}`}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newSlug.trim()}
              className={`h-11 rounded-admin-sm bg-admin-primary-text px-5 text-sm font-bold text-white transition-colors hover:brightness-110 disabled:opacity-50 ${FOCUS_RING}`}
            >
              {loading ? t("blocklist.adding") : t("blocklist.addButton")}
            </button>
          </form>
        </AdminCard>

        {/* List */}
        <AdminCard className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-[15px] font-bold text-admin-ink">
              {t("blocklist.listTitle")} <span className="font-mono tabular-nums text-admin-ink-faint">({filteredList.length})</span>
            </h3>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("blocklist.searchPlaceholder")}
              className={`h-9 rounded-admin-sm border border-admin-border px-3 text-sm text-admin-ink outline-none placeholder:text-admin-ink-faint ${FOCUS_RING}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredList.map((slug) => (
              <div
                key={slug}
                className="group flex items-center gap-1.5 rounded-admin-sm border border-admin-border bg-admin-canvas px-3 py-1.5 font-mono text-[12px] text-admin-ink"
              >
                <span>{slug}</span>
                {confirmSlug === slug ? (
                  <span className="ml-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRemove(slug)}
                      disabled={loading}
                      className={`rounded-admin-sm bg-admin-rose px-2.5 py-1 text-[11px] font-bold text-white hover:brightness-110 disabled:opacity-50 ${FOCUS_RING}`}
                    >
                      {t("users.yes")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSlug(null)}
                      className={`rounded-admin-sm bg-admin-ink/5 px-2.5 py-1 text-[11px] font-bold text-admin-ink hover:bg-admin-ink/10 ${FOCUS_RING}`}
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
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-admin-ink-faint transition-colors hover:bg-admin-rose-tint hover:text-admin-rose ${FOCUS_RING}`}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {filteredList.length === 0 && (
            <p className="py-6 text-center text-sm font-medium text-admin-ink-soft">
              {t("blocklist.emptySearch", { search })}
            </p>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
