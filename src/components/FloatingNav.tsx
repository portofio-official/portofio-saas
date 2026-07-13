"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { List, X } from "@phosphor-icons/react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function FloatingNav() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Nav");

  const links = [
    { href: "#features", label: t("features") },
    { href: "#templates", label: t("templates") },
    { href: "#pricing", label: t("pricing") },
  ];

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-40 flex justify-center">
        <nav className="mt-6 mx-auto w-max flex items-center gap-1 rounded-full bg-surface/80 backdrop-blur-xl ring-1 ring-black/5 px-2 py-2 shadow-[0_16px_48px_-24px_rgba(23,23,26,0.22)]">
          <span className="pl-3 pr-4 font-display text-[15px] font-medium text-ink">
            Portofio
          </span>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm text-ink-soft hover:bg-black/[0.04] hover:text-ink transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Link
            href="/login"
            className="hidden md:block px-4 py-2 rounded-full text-sm text-ink-soft hover:bg-black/[0.04] hover:text-ink transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            {t("login")}
          </Link>

          <div className="hidden md:flex items-center gap-0.5 ml-1 rounded-full bg-black/[0.04] p-0.5 text-xs">
            {routing.locales.map((loc) => (
              <Link
                key={loc}
                href={pathname}
                locale={loc}
                className={`px-2.5 py-1 rounded-full uppercase tracking-wide transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  locale === loc
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                {loc}
              </Link>
            ))}
          </div>

          <button
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            {open ? <X size={18} weight="light" /> : <List size={18} weight="light" />}
          </button>
        </nav>
      </div>

      <div
        className={`fixed inset-0 z-50 md:hidden bg-white/85 backdrop-blur-3xl transition-opacity duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          aria-label={t("closeMenu")}
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-black/[0.04]"
        >
          <X size={20} weight="light" />
        </button>

        <div className="flex h-full flex-col items-center justify-center gap-6">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
              className={`font-display text-3xl text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            >
              {link.label}
            </a>
          ))}

          <Link
            href="/login"
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${100 + links.length * 50}ms` : "0ms" }}
            className={`font-display text-3xl text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {t("login")}
          </Link>

          <div className="mt-4 flex items-center gap-2 rounded-full bg-black/[0.04] p-1 text-sm">
            {routing.locales.map((loc) => (
              <Link
                key={loc}
                href={pathname}
                locale={loc}
                onClick={() => setOpen(false)}
                className={`px-3 py-1.5 rounded-full uppercase tracking-wide ${
                  locale === loc ? "bg-surface text-ink shadow-sm" : "text-ink-faint"
                }`}
              >
                {loc}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
