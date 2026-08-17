"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TemplateId } from "@/templates/types";
import { PreviewTemplateRenderer as TemplateRenderer, type TemplateCatalogItem } from "@/templates/registry";

export interface TemplateCardProps {
  meta: TemplateCatalogItem;
  index: number;
  previewData: unknown;
  isInUse?: boolean;
  onPreview: (id: TemplateId) => void;
  onUse: (id: TemplateId) => void;
}

export function TemplateCard({ meta, index, previewData, isInUse = false, onPreview, onUse }: TemplateCardProps) {
  const t = useTranslations("TemplateGallery");
  const [isHovered, setIsHovered] = useState(false);
  const badge = isInUse ? t("inUse") : meta.popular ? `★ ${t("popular")}` : null;

  return (
    <div
      className="gsap-template-card group relative flex flex-col gap-2.5 animate-fade-in-up-custom"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Canvas — clean full-bleed, no fake browser chrome */}
      <div className="relative h-[220px] sm:h-[240px] w-full overflow-hidden rounded-2xl border border-black/10 bg-shell shadow-xs transition-all duration-200 ease-out group-hover:border-black/20 group-hover:shadow-md">
        <div
          className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-300 ease-out group-hover:scale-[1.015]"
          style={{ transform: "scale(0.33)", width: "303%", height: "303%" }}
        >
          <TemplateRenderer templateId={meta.id} data={previewData} />
        </div>

        {/* Hover quick actions */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center gap-2.5 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-coarse:opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(meta.id);
            }}
            className="flex h-11 items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-[12px] font-semibold text-ink shadow-xs ring-1 ring-black/10 transition-all duration-150 hover:bg-white hover:text-accent-deep active:scale-[0.98]"
            title={t("previewLive")}
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            {t("previewLive")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUse(meta.id);
            }}
            className="flex h-11 items-center gap-1.5 rounded-full bg-accent px-3.5 text-[12px] font-bold text-white transition-all duration-150 hover:bg-accent-deep active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            {t("useTemplate")}
          </button>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="truncate font-display text-[14px] font-semibold text-ink">{meta.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-ink-faint leading-relaxed">
            {meta.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {meta.tags
              .filter((tag) => tag !== "All")
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-ink/[0.04] px-2 py-0.5 text-[10px] font-medium text-ink-soft"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-accent-deep ring-1 ring-accent/20">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
