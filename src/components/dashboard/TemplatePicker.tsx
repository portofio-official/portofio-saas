"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "@phosphor-icons/react";
import { useAutosave } from "@/hooks/useAutosave";
import { savePortfolioDataAction } from "@/lib/portfolio/actions";
import { saveTemplateIdAction } from "@/lib/templates/actions";
import type { PortfolioData } from "@/lib/portfolio/types";
import { TEMPLATE_IDS, FONT_OPTIONS, ACCENT_COLOR_PRESETS, type TemplateId } from "@/lib/templates/types";
import { TemplateRenderer } from "@/components/templates/registry";
import { Eyebrow } from "@/components/ui/CtaButton";
import { FormPanel } from "@/components/ui/FormPanel";

export function TemplatePicker({
  initialData,
  initialTemplateId,
}: {
  initialData: PortfolioData;
  initialTemplateId: TemplateId;
}) {
  const [data, setData] = useState(initialData);
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [visibleTemplateId, setVisibleTemplateId] = useState(initialTemplateId);
  const fading = templateId !== visibleTemplateId;

  const dataStatus = useAutosave(data, savePortfolioDataAction);
  const templateStatus = useAutosave(templateId, saveTemplateIdAction);

  useEffect(() => {
    if (!fading) return;
    const timeout = setTimeout(() => setVisibleTemplateId(templateId), 250);
    return () => clearTimeout(timeout);
  }, [fading, templateId]);

  const t = useTranslations("TemplatePicker");
  const tTemplates = useTranslations("Templates");
  const tSaveStatus = useTranslations("PortfolioForm.saveStatus");
  const templateItems = tTemplates.raw("items") as { name: string; description: string }[];
  const status = dataStatus === "saving" || templateStatus === "saving" ? "saving" : dataStatus;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            {t("title")}
          </h1>
        </div>
        <span className="shrink-0 text-sm text-ink-soft">{tSaveStatus(status)}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <FormPanel eyebrow={tTemplates("eyebrow")} title={tTemplates("title")}>
            <div className="flex flex-col gap-3">
              {TEMPLATE_IDS.map((id, index) => {
                const isSelected = id === templateId;
                const item = templateItems[index];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTemplateId(id)}
                    className={`flex items-start justify-between gap-3 rounded-2xl p-4 text-left ring-1 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isSelected
                        ? "bg-accent-tint ring-accent/20"
                        : "ring-black/[0.07] hover:ring-black/20"
                    }`}
                  >
                    <div>
                      <p className="font-display text-lg font-medium text-ink">{item?.name}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">{item?.description}</p>
                    </div>
                    {isSelected && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                        <Check size={14} weight="bold" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </FormPanel>

          <FormPanel eyebrow={t("eyebrow")} title={t("accentColorLabel")}>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => setData((d) => ({ ...d, theme: { ...d.theme, accentColor: color } }))}
                  className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-black/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  {data.theme.accentColor === color && <Check size={16} weight="bold" className="text-white" />}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink-soft">{t("fontLabel")}</span>
              <div className="flex flex-wrap gap-2">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, theme: { ...d.theme, font } }))}
                    className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      data.theme.font === font
                        ? "bg-ink text-white"
                        : "bg-black/[0.04] text-ink-soft hover:text-ink"
                    }`}
                  >
                    {t(`fontOptions.${font}`)}
                  </button>
                ))}
              </div>
            </div>
          </FormPanel>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
            <div className="flex flex-col gap-3 rounded-[calc(2rem-0.375rem)] bg-surface p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)] ring-1 ring-black/[0.04]">
              <span className="px-2 pt-1 text-[13px] text-ink-soft">{t("previewLabel")}</span>
              <div
                className={`h-[720px] overflow-y-auto rounded-2xl transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  fading ? "opacity-0" : "opacity-100"
                }`}
              >
                <TemplateRenderer templateId={visibleTemplateId} data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
