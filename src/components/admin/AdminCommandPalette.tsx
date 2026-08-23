"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { getAdminSearchIndexAction, type AdminSearchIndex } from "@/lib/admin";

type Item = { key: string; label: string; sub?: string; href: string; group: string };

const PAGES = ["/admin", "/admin/users", "/admin/templates", "/admin/blocklist", "/admin/audit-log"] as const;

export function AdminCommandPalette() {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<AdminSearchIndex | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Mirrors `open` for the keydown listener, which is registered once and
  // would otherwise close over a stale `open` value.
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const closePalette = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger so keyboard users aren't dropped after the dialog closes.
    triggerRef.current?.focus();
  }, []);

  const openPalette = useCallback(() => {
    setQuery("");
    setActiveIdx(0);
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 30);
    if (!index) {
      getAdminSearchIndexAction()
        .then(setIndex)
        .catch(() => setIndex({ users: [], templates: [], blocklist: [] }));
    }
  }, [index]);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) closePalette();
        else openPalette();
      } else if (e.key === "Escape") {
        closePalette();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPalette, closePalette]);

  const items = useMemo<Item[]>(() => {
    const pageLabels: Record<(typeof PAGES)[number], string> = {
      "/admin": t("navOverview"),
      "/admin/users": t("navUsers"),
      "/admin/templates": t("navTemplates"),
      "/admin/blocklist": t("navBlocklist"),
      "/admin/audit-log": t("navAuditLog"),
    };
    const pageItems: Item[] = PAGES.map((href) => ({
      key: `page-${href}`,
      label: pageLabels[href],
      href,
      group: t("command.groupPages"),
    }));
    if (!index) return pageItems;
    const userItems: Item[] = index.users.map((u) => ({
      key: `user-${u.id}`,
      label: u.label,
      sub: u.email,
      href: "/admin/users",
      group: t("command.groupUsers"),
    }));
    const templateItems: Item[] = index.templates.map((tpl) => ({
      key: `tpl-${tpl.id}`,
      label: tpl.name,
      sub: tpl.id,
      href: "/admin/templates",
      group: t("command.groupTemplates"),
    }));
    const blocklistItems: Item[] = index.blocklist.map((slug) => ({
      key: `block-${slug}`,
      label: slug,
      href: "/admin/blocklist",
      group: t("command.groupBlocklist"),
    }));
    return [...pageItems, ...userItems, ...templateItems, ...blocklistItems];
  }, [index, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.sub?.toLowerCase().includes(q)).slice(0, 20);
  }, [items, query]);

  const go = useCallback(
    (href: string) => {
      router.push(href);
      closePalette();
    },
    [router, closePalette],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      go(filtered[activeIdx].href);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPalette}
        aria-label={t("command.trigger")}
        className="flex h-9 items-center gap-2 rounded-admin-sm border border-admin-border bg-admin-surface px-3 text-[13px] text-admin-ink-faint transition-colors hover:border-admin-ink/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary sm:min-w-[220px]"
      >
        <MagnifyingGlass size={15} />
        <span className="hidden flex-1 text-left sm:inline">{t("command.trigger")}</span>
        <kbd className="hidden rounded-admin-sm border border-admin-border px-1.5 py-0.5 font-mono text-[10px] text-admin-ink-faint sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-admin-ink/30 px-4 pt-[12vh]" onClick={closePalette}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("command.trigger")}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-admin-lg border border-admin-border bg-admin-surface"
          >
            <div className="flex items-center gap-2 border-b border-admin-border px-4 py-3">
              <MagnifyingGlass size={16} className="text-admin-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={t("command.placeholder")}
                aria-label={t("command.placeholder")}
                className="flex-1 bg-transparent text-[14px] text-admin-ink outline-none placeholder:text-admin-ink-faint"
              />
              <kbd className="rounded-admin-sm border border-admin-border px-1.5 py-0.5 font-mono text-[10px] text-admin-ink-faint">
                Esc
              </kbd>
            </div>
            <ul role="listbox" className="max-h-80 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-[13px] text-admin-ink-soft">{t("command.empty")}</li>
              )}
              {filtered.map((item, i) => (
                <li key={item.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => go(item.href)}
                    className={`flex w-full items-center justify-between gap-3 rounded-admin-sm px-3 py-2 text-left text-[13px] transition-colors ${
                      i === activeIdx ? "bg-admin-primary-tint text-admin-primary-text" : "text-admin-ink hover:bg-admin-ink/5"
                    }`}
                  >
                    <span className="min-w-0 truncate">
                      {item.label}
                      {item.sub && <span className="ml-2 font-mono text-[11px] text-admin-ink-faint">{item.sub}</span>}
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-admin-ink-faint">{item.group}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
