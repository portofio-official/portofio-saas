"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { useAutosave } from "@/hooks/useAutosave";
import { savePortfolioDataAction } from "@/lib/portfolio/actions";
import { saveTemplateIdAction } from "@/lib/templates/actions";
import type { PortfolioData } from "@/lib/portfolio/types";
import { TEMPLATE_IDS, FONT_OPTIONS, ACCENT_COLOR_PRESETS, type TemplateId } from "@/lib/templates/types";
import { LegacyTemplateRenderer as TemplateRenderer } from "@/components/templates/registry";
import { Eyebrow } from "@/components/ui/CtaButton";
import { FormPanel } from "@/components/ui/FormPanel";

// Portofolio Form Sections
import { ProfileSection } from "@/components/portfolio/sections/ProfileSection";
import { ExperienceSection } from "@/components/portfolio/sections/ExperienceSection";
import { EducationSection } from "@/components/portfolio/sections/EducationSection";
import { SkillsSection } from "@/components/portfolio/sections/SkillsSection";
import { ProjectsSection } from "@/components/portfolio/sections/ProjectsSection";
import { ContactSection } from "@/components/portfolio/sections/ContactSection";
import { SocialsSection } from "@/components/portfolio/sections/SocialsSection";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Editor({
  workspaceId,
  initialData,
  initialTemplateId,
}: {
  workspaceId: string;
  initialData: PortfolioData;
  initialTemplateId: TemplateId;
}) {
  const [data, setData] = useState(initialData);
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [visibleTemplateId, setVisibleTemplateId] = useState(initialTemplateId);
  const [showDesktopPreview, setShowDesktopPreview] = useState(false);
  const fading = templateId !== visibleTemplateId;
  const container = useRef<HTMLDivElement>(null);

  const dataStatus = useAutosave(data, (d) => savePortfolioDataAction(workspaceId, d));
  const templateStatus = useAutosave(templateId, (id) => saveTemplateIdAction(workspaceId, id));

  useEffect(() => {
    if (!fading) return;
    const timeout = setTimeout(() => setVisibleTemplateId(templateId), 250);
    return () => clearTimeout(timeout);
  }, [fading, templateId]);

  useGSAP(() => {
    gsap.fromTo(
      ".gsap-header",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    );

    gsap.fromTo(
      ".gsap-panel",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: "power4.out", delay: 0.1 }
    );

    gsap.fromTo(
      ".gsap-preview",
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.3 }
    );
  }, { scope: container });

  const t = useTranslations("TemplatePicker");
  const tTemplates = useTranslations("Templates");
  const tSaveStatus = useTranslations("PortfolioForm.saveStatus");
  const templateItems = tTemplates.raw("items") as { name: string; description: string }[];
  const status = dataStatus === "saving" || templateStatus === "saving" ? "saving" : dataStatus;

  // Form translations
  const tProfile = useTranslations("PortfolioForm.profile");
  const tExperience = useTranslations("PortfolioForm.experience");
  const tEducation = useTranslations("PortfolioForm.education");
  const tSkills = useTranslations("PortfolioForm.skills");
  const tProjects = useTranslations("PortfolioForm.projects");
  const tContact = useTranslations("PortfolioForm.contact");
  const tSocials = useTranslations("PortfolioForm.socials");

  return (
    <div ref={container} className="flex flex-col gap-6">
      <div className="gsap-header flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            {t("title")}
          </h1>
        </div>
        <span className="shrink-0 text-sm font-medium text-ink-soft">{tSaveStatus(status)}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-5 h-[800px] overflow-y-auto pr-2 pb-16">
          <div className="gsap-panel">
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
                      className={`group flex items-start justify-between gap-3 rounded-2xl p-4 text-left ring-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${isSelected
                          ? "bg-accent-tint ring-accent/20"
                          : "bg-surface ring-black/10 hover:ring-black/20 shadow-sm"
                        }`}
                    >
                      <div>
                        <p className={`font-display text-lg font-bold transition-colors ${isSelected ? "text-accent-deep" : "text-ink"}`}>{item?.name}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">{item?.description}</p>
                      </div>
                      {isSelected && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </FormPanel>
          </div>

          <div className="gsap-panel">
            <FormPanel eyebrow={t("eyebrow")} title={t("accentColorLabel")}>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => setData((d) => ({ ...d, theme: { ...d.theme, accentColor: color } }))}
                    className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-black/10 transition-all duration-300 hover:scale-110 hover:shadow-md"
                    style={{ backgroundColor: color }}
                  >
                    {data.theme.accentColor === color && <span className="material-symbols-outlined text-white text-[20px]">check</span>}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <span className="text-[13px] font-medium text-ink-soft">{t("fontLabel")}</span>
                <div className="flex flex-wrap gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, theme: { ...d.theme, font } }))}
                      className={`rounded-full px-4 py-2 text-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 ${data.theme.font === font
                          ? "bg-ink text-white shadow-md"
                          : "bg-surface ring-1 ring-black/5 text-ink-soft hover:text-ink hover:ring-black/10"
                        }`}
                    >
                      {t(`fontOptions.${font}`)}
                    </button>
                  ))}
                </div>
              </div>
            </FormPanel>
          </div>

          <div className="gsap-panel">
            <ProfileSection t={tProfile} profile={data.profile} onChange={(patch) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }))} />
          </div>
          <div className="gsap-panel">
            <ExperienceSection t={tExperience} items={data.experiences} onChange={(experiences) => setData((d) => ({ ...d, experiences }))} />
          </div>
          <div className="gsap-panel">
            <EducationSection t={tEducation} items={data.educations} onChange={(educations) => setData((d) => ({ ...d, educations }))} />
          </div>
          <div className="gsap-panel">
            <SkillsSection eyebrow={tSkills("eyebrow")} title={tSkills("title")} placeholder={tSkills("placeholder")} removeLabel={tSkills("removeLabel")} skills={data.skills} onChange={(skills) => setData((d) => ({ ...d, skills }))} />
          </div>
          <div className="gsap-panel">
            <ProjectsSection t={tProjects} items={data.projects} onChange={(projects) => setData((d) => ({ ...d, projects }))} />
          </div>
          <div className="gsap-panel">
            <ContactSection t={tContact} contact={data.contact} onChange={(patch) => setData((d) => ({ ...d, contact: { ...d.contact, ...patch } }))} />
          </div>
          <div className="gsap-panel">
            <SocialsSection t={tSocials} items={data.socials} onChange={(socials) => setData((d) => ({ ...d, socials }))} />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="gsap-preview sticky top-6 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between px-2 pt-1 pb-4">
              <span className="text-[13px] font-medium text-ink-soft">{t("previewLabel")}</span>
              <button
                type="button"
                onClick={() => setShowDesktopPreview(true)}
                className="group flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-ink transition-all duration-300 hover:bg-black/10 hover:scale-105"
              >
                <span className="material-symbols-outlined text-[16px] transition-transform group-hover:text-accent">desktop_windows</span> Desktop Preview
              </button>
            </div>
            <div
              className={`h-[700px] overflow-y-auto rounded-2xl border border-black/5 bg-canvas transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"
                }`}
            >
              <TemplateRenderer templateId={visibleTemplateId} data={data} />
            </div>
          </div>
        </div>
      </div>

      {showDesktopPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 shadow-sm">
            <span className="font-display text-lg font-bold text-ink">Desktop Preview</span>
            <button
              onClick={() => setShowDesktopPreview(false)}
              className="group flex items-center gap-2 rounded-full bg-black/5 px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:bg-black/10 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90 group-hover:text-danger">close</span> Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-canvas p-8">
            <div className="mx-auto w-full max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-floating ring-1 ring-black/5">
              <TemplateRenderer templateId={visibleTemplateId} data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
