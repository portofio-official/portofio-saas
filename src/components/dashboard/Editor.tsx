"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations, useLocale } from "next-intl";
import { useAutosave } from "@/hooks/useAutosave";
import { saveDraftAction } from "@/lib/projects/actions";
import { FONT_OPTIONS, ACCENT_COLOR_PRESETS, type TemplateId } from "@/lib/templates/types";
import type { BasePortfolioData } from "@/lib/templates/schemas/_base";
import type { WebsiteDocument } from "@/lib/templates/definition";
import { LegacyTemplateRenderer as TemplateRenderer } from "@/components/templates/registry";

// Portfolio Form Sections
import { ProfileSection } from "@/components/portfolio/sections/ProfileSection";
import { ExperienceSection } from "@/components/portfolio/sections/ExperienceSection";
import { EducationSection } from "@/components/portfolio/sections/EducationSection";
import { SkillsSection } from "@/components/portfolio/sections/SkillsSection";
import { ProjectsSection } from "@/components/portfolio/sections/ProjectsSection";
import { ContactSection } from "@/components/portfolio/sections/ContactSection";
import { SocialsSection } from "@/components/portfolio/sections/SocialsSection";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Editor({
  projectId,
  initialDocument,
  initialTemplateId,
}: {
  projectId: string;
  initialDocument: WebsiteDocument;
  initialTemplateId: TemplateId;
}) {
  // data is the parsed portfolio payload from the WebsiteDocument
  const [data, setData] = useState<BasePortfolioData>(
    (initialDocument.data ?? {}) as BasePortfolioData,
  );
  const templateId = initialTemplateId;
  const [showDesktopPreview, setShowDesktopPreview] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  // Build a WebsiteDocument from current data state for autosave
  const documentForSave = (): WebsiteDocument => ({
    ...initialDocument,
    meta: {
      ...initialDocument.meta,
      templateId: templateId,
      updatedAt: new Date().toISOString(),
    },
    data: data as Record<string, unknown>,
  });

  // Autosave: debounce writes to projects.draft_json
  const saveStatus = useAutosave(data, () => saveDraftAction(projectId, documentForSave()));

  // No template changing effect needed

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-header",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
      );
      gsap.fromTo(
        ".gsap-panel",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: "power4.out", delay: 0.1 },
      );
      gsap.fromTo(
        ".gsap-preview",
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.3 },
      );
    },
    { scope: container },
  );

  const t = useTranslations("TemplatePicker");
  const tSaveStatus = useTranslations("PortfolioForm.saveStatus");
  const status = saveStatus;

  // Form section translations
  const tProfile = useTranslations("PortfolioForm.profile");
  const tExperience = useTranslations("PortfolioForm.experience");
  const tEducation = useTranslations("PortfolioForm.education");
  const tSkills = useTranslations("PortfolioForm.skills");
  const tProjects = useTranslations("PortfolioForm.projects");
  const tContact = useTranslations("PortfolioForm.contact");
  const tSocials = useTranslations("PortfolioForm.socials");

  const locale = useLocale();

  return (
    <div ref={container} className="flex h-full flex-col overflow-hidden bg-surface text-ink font-sans">
      {/* Top Header */}
      <header className="gsap-header relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-black/5 bg-surface px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <a
            href={`/${locale}/dashboard`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
            aria-label="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </a>
          <span className="font-display text-[14px] font-bold tracking-tight text-ink">Editor</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-medium text-ink-soft">{tSaveStatus(status)}</span>
          <button
            onClick={() => setShowDesktopPreview(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-bold text-white shadow-sm transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined text-[14px]">desktop_windows</span>
            Preview
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Content & Data */}
        <aside className="gsap-panel flex w-[300px] shrink-0 flex-col border-r border-black/5 bg-surface">
          <div className="flex h-12 shrink-0 items-center border-b border-black/5 px-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">Content Layers</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            <div className="flex flex-col gap-6">
              <ProfileSection
                t={tProfile}
                profile={data.profile}
                onChange={(patch) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }))}
              />
              <ExperienceSection
                t={tExperience}
                items={data.experiences}
                onChange={(experiences) => setData((d) => ({ ...d, experiences }))}
              />
              <EducationSection
                t={tEducation}
                items={data.educations}
                onChange={(educations) => setData((d) => ({ ...d, educations }))}
              />
              <SkillsSection
                eyebrow={tSkills("eyebrow")}
                title={tSkills("title")}
                placeholder={tSkills("placeholder")}
                removeLabel={tSkills("removeLabel")}
                skills={data.skills}
                onChange={(skills) => setData((d) => ({ ...d, skills }))}
              />
              <ProjectsSection
                t={tProjects}
                items={data.projects}
                onChange={(projects) => setData((d) => ({ ...d, projects }))}
              />
              <ContactSection
                t={tContact}
                contact={data.contact}
                onChange={(patch) => setData((d) => ({ ...d, contact: { ...d.contact, ...patch } }))}
              />
              <SocialsSection
                t={tSocials}
                items={data.socials}
                onChange={(socials) => setData((d) => ({ ...d, socials }))}
              />
            </div>
          </div>
        </aside>

        {/* Center Canvas: Preview Area */}
        <main className="relative flex flex-1 flex-col overflow-y-auto bg-canvas p-6 scrollbar-thin md:p-8">
          <div className="gsap-preview mx-auto flex w-full max-w-[1200px] flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-2xl ring-1 ring-black/5">
             <div className="flex h-10 shrink-0 items-center justify-between border-b border-black/5 bg-surface px-4">
               <div className="flex gap-1.5">
                 <div className="h-3 w-3 rounded-full bg-danger/80" />
                 <div className="h-3 w-3 rounded-full bg-[#F5A623]/80" />
                 <div className="h-3 w-3 rounded-full bg-accent/80" />
               </div>
               <span className="text-[11px] font-medium text-ink-faint">Live Render</span>
               <div className="w-10" />
             </div>
             <div className="h-[800px] w-full overflow-y-auto bg-white scrollbar-thin">
               <TemplateRenderer templateId={templateId} data={data} />
             </div>
          </div>
        </main>

        {/* Right Sidebar: Design Properties */}
        <aside className="gsap-panel flex w-[280px] shrink-0 flex-col border-l border-black/5 bg-surface">
          <div className="flex h-12 shrink-0 items-center border-b border-black/5 px-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">Design Properties</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            <div className="flex flex-col gap-8">
              {/* Accent Color Section */}
              <div className="flex flex-col gap-4">
                <span className="text-[12px] font-bold text-ink">{t("accentColorLabel")}</span>
                <div className="grid grid-cols-3 gap-3">
                  {ACCENT_COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={color}
                      onClick={() => setData((d) => ({ ...d, theme: { ...d.theme, accentColor: color } }))}
                      className="group relative flex h-12 w-full items-center justify-center rounded-[1rem] ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {data.theme.accentColor === color && (
                        <span className="material-symbols-outlined text-white text-[18px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Section */}
              <div className="flex flex-col gap-4">
                <span className="text-[12px] font-bold text-ink">{t("fontLabel")}</span>
                <div className="flex flex-col gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, theme: { ...d.theme, font } }))}
                      className={`flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-left text-[13px] transition-all duration-300 ${
                        data.theme.font === font
                          ? "bg-ink text-white font-medium shadow-md"
                          : "bg-surface ring-1 ring-black/5 text-ink hover:bg-black/5"
                      }`}
                    >
                      <span>{t(`fontOptions.${font}`)}</span>
                      {data.theme.font === font && (
                         <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Fullscreen Desktop Preview Modal */}
      {showDesktopPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 shadow-sm">
            <span className="font-display text-lg font-bold text-ink">Desktop Preview</span>
            <button type="button"
              onClick={() => setShowDesktopPreview(false)}
              className="group flex items-center gap-2 rounded-full bg-black/5 px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:bg-black/10 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90 group-hover:text-danger">
                close
              </span>{" "}
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-canvas p-8">
            <div className="mx-auto w-full max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-floating ring-1 ring-black/5">
              <TemplateRenderer templateId={templateId} data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
