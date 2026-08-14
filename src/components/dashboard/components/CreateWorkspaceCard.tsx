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
      className="group flex min-h-[220px] flex-col overflow-hidden rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] animate-fade-in-up-custom"
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
    >
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3.5 rounded-[1.4rem] border-2 border-dashed border-black/10 bg-surface px-6 py-8 text-center transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent/[0.02]">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white shadow-xs group-hover:shadow-[0_8px_20px_rgba(0,207,124,0.4)]">
          <span className="material-symbols-outlined text-[24px]">add</span>
        </div>
        <div>
          <p className="font-display text-[15px] font-bold text-ink transition-colors duration-200 group-hover:text-accent-deep">
            {t("createWebsite")}
          </p>
          <p className="mt-1 max-w-[220px] text-[12px] font-normal text-ink-soft">
            {t("createWebsiteDesc")}
          </p>
        </div>
      </div>
    </Link>
  );
}
