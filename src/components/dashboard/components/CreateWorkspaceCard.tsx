"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export interface CreateWorkspaceCardProps {
  index?: number;
}

export function CreateWorkspaceCard({ index = 0 }: CreateWorkspaceCardProps) {
  const t = useTranslations("Dashboard");

  return (
    <Link
      href="/dashboard/templates"
      className="group flex h-[220px] sm:h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-ink/[0.02] p-6 text-center transition-all duration-200 ease-out hover:border-accent/60 hover:bg-accent/[0.02] animate-fade-in-up-custom"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      <div className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.04] text-ink-soft ring-1 ring-black/5 transition-all duration-200 group-hover:bg-accent group-hover:text-white group-hover:scale-105">
        <span className="material-symbols-outlined text-[20px]">add</span>
      </div>
      <p className="mt-3 font-display text-[14px] font-semibold text-ink transition-colors group-hover:text-accent-deep">
        {t("createWebsite")}
      </p>
      <p className="mt-0.5 max-w-[200px] text-[12px] font-medium text-ink-faint">
        {t("createWebsiteDesc")}
      </p>
    </Link>
  );
}
