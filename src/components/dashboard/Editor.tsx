"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations, useLocale } from "next-intl";
import { useAutosave } from "@/hooks/useAutosave";
import { saveDraftAction, publishProjectAction, unpublishProjectAction } from "@/lib/projects/actions";
import { FONT_OPTIONS, ACCENT_COLOR_PRESETS, type TemplateId } from "@/lib/templates/types";
import type { BasePortfolioData } from "@/lib/templates/schemas/_base";
import type { StudioData } from "@/components/templates/studio/schema";
import type { PortfolioProData } from "@/components/templates/portfolio-pro/schema";
import type { WebsiteDocument } from "@/lib/templates/definition";
import { PreviewTemplateRenderer as TemplateRenderer } from "@/components/templates/registry";

// Portfolio Form Sections
import { ProfileSection } from "@/components/portfolio/sections/ProfileSection";
import { ExperienceSection } from "@/components/portfolio/sections/ExperienceSection";
import { EducationSection } from "@/components/portfolio/sections/EducationSection";
import { SkillsSection } from "@/components/portfolio/sections/SkillsSection";
import { ProjectsSection } from "@/components/portfolio/sections/ProjectsSection";
import { ContactSection } from "@/components/portfolio/sections/ContactSection";
import { SocialsSection } from "@/components/portfolio/sections/SocialsSection";
import { StudioHeroSection, StudioExpertiseSection, StudioTestimonialsSection } from "@/components/templates/studio/Sections";
import {
  PortfolioProHeroSection,
  PortfolioProAboutSection,
  PortfolioProSkillsSection,
  PortfolioProExperienceSection,
  PortfolioProEducationSection,
  PortfolioProCaseStudiesSection,
  PortfolioProCertificatesSection,
  PortfolioProGallerySection,
} from "@/components/templates/portfolio-pro/Sections";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// `studio` and `portfolio-pro` both declare a `hero` field with incompatible
// shapes, so a plain `Partial<StudioData> & Partial<PortfolioProData>`
// intersection is unsatisfiable — union the one field that collides instead.
type EditorData = BasePortfolioData &
  Partial<Omit<StudioData, "hero">> &
  Partial<Omit<PortfolioProData, "hero">> & { hero?: StudioData["hero"] | PortfolioProData["hero"] };

export function Editor({
  projectId,
  initialDocument,
  initialTemplateId,
  initialSubdomain,
  initialStatus,
  rootDomain,
}: {
  projectId: string;
  initialDocument: WebsiteDocument;
  initialTemplateId: TemplateId;
  initialSubdomain?: string | null;
  initialStatus?: "draft" | "published";
  rootDomain?: string;
}) {
  const [data, setData] = useState<EditorData>(
    (initialDocument.data ?? {}) as EditorData,
  );
  const templateId = initialTemplateId;
  const [showDesktopPreview, setShowDesktopPreview] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  // Publish state
  const [subdomain, setSubdomain] = useState(initialSubdomain ?? "");
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">(
    initialStatus ?? "draft",
  );
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  const domain = rootDomain ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

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

  const saveStatus = useAutosave(data, () => saveDraftAction(projectId, documentForSave()));

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

  const tProfile = useTranslations("PortfolioForm.profile");
  const tExperience = useTranslations("PortfolioForm.experience");
  const tEducation = useTranslations("PortfolioForm.education");
  const tSkills = useTranslations("PortfolioForm.skills");
  const tProjects = useTranslations("PortfolioForm.projects");
  const tContact = useTranslations("PortfolioForm.contact");
  const tSocials = useTranslations("PortfolioForm.socials");

  const locale = useLocale();

  async function handlePublish() {
    setPublishLoading(true);
    setPublishError(null);
    const result = await publishProjectAction(projectId, subdomain);
    setPublishLoading(false);
    if (result.ok) {
      setPublishStatus("published");
    } else if (result.requiresSubscription) {
      setPublishError("subscription_required");
    } else {
      setPublishError(result.error ?? "Failed to publish.");
    }
  }

  async function handleUnpublish() {
    setPublishLoading(true);
    setPublishError(null);
    const result = await unpublishProjectAction(projectId);
    setPublishLoading(false);
    if (result.ok) {
      setPublishStatus("draft");
    } else {
      setPublishError(result.error ?? "Failed to unpublish.");
    }
  }

  const siteUrl = `${subdomain}.${domain}`;

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
          <span className="text-[12px] font-medium text-ink-soft">{tSaveStatus(saveStatus)}</span>
          {/* Live badge in header */}
          {publishStatus === "published" && subdomain && (
            <a
              href={`http://${siteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-positive/10 px-3 py-1 text-[11px] font-bold text-positive hover:bg-positive/20 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-positive" />
              Live
            </a>
          )}
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
              {templateId === "studio" && (
                <StudioHeroSection
                  hero={(data.hero as StudioData["hero"]) || { headline: "", subheadline: "", ctaLabel: "" }}
                  onChange={(patch) => setData((d) => ({ ...d, hero: { ...d.hero, ...patch } as StudioData["hero"] }))}
                />
              )}
              {templateId === "portfolio-pro" && (
                <>
                  <PortfolioProHeroSection
                    hero={(data.hero as PortfolioProData["hero"]) || { badges: [] }}
                    onChange={(patch) => setData((d) => ({ ...d, hero: { ...d.hero, ...patch } as PortfolioProData["hero"] }))}
                  />
                  <PortfolioProAboutSection
                    about={data.about || { paragraphs: [], tags: [] }}
                    onChange={(patch) => setData((d) => ({ ...d, about: { ...d.about, ...patch } as PortfolioProData["about"] }))}
                  />
                </>
              )}
              {templateId !== "portfolio-pro" && (
                <>
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
                </>
              )}
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
              {templateId === "studio" && (
                <>
                  <StudioExpertiseSection
                    items={data.expertise || []}
                    onChange={(expertise) => setData((d) => ({ ...d, expertise }))}
                  />
                  <StudioTestimonialsSection
                    items={data.testimonials || []}
                    onChange={(testimonials) => setData((d) => ({ ...d, testimonials }))}
                  />
                </>
              )}
              {templateId === "portfolio-pro" && (
                <>
                  <PortfolioProSkillsSection
                    items={data.skillsShowcase || []}
                    onChange={(skillsShowcase) => setData((d) => ({ ...d, skillsShowcase }))}
                  />
                  <PortfolioProExperienceSection
                    items={data.experienceDetails || []}
                    onChange={(experienceDetails) => setData((d) => ({ ...d, experienceDetails }))}
                  />
                  <PortfolioProEducationSection
                    items={data.educationDetails || []}
                    onChange={(educationDetails) => setData((d) => ({ ...d, educationDetails }))}
                  />
                  <PortfolioProCaseStudiesSection
                    items={data.caseStudies || []}
                    onChange={(caseStudies) => setData((d) => ({ ...d, caseStudies }))}
                  />
                  <PortfolioProCertificatesSection
                    items={data.certificates || []}
                    onChange={(certificates) => setData((d) => ({ ...d, certificates }))}
                  />
                  <PortfolioProGallerySection
                    items={data.gallery || []}
                    onChange={(gallery) => setData((d) => ({ ...d, gallery }))}
                  />
                </>
              )}
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

        {/* Right Sidebar: Design Properties + Publish */}
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

              {/* Divider */}
              <div className="h-px bg-black/5" />

              {/* Publish Panel */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-ink">Publish</span>
                  {publishStatus === "published" && (
                    <span className="rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-bold text-positive">
                      Live
                    </span>
                  )}
                </div>

                {publishStatus === "published" ? (
                  /* Published state */
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 rounded-[0.75rem] bg-positive/5 px-3 py-2 ring-1 ring-positive/20">
                      <span className="material-symbols-outlined text-[14px] text-positive">public</span>
                      <a
                        href={`http://${siteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[12px] font-medium text-positive hover:underline"
                      >
                        {siteUrl}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={handleUnpublish}
                      disabled={publishLoading}
                      className="flex w-full items-center justify-center gap-1.5 rounded-[1rem] bg-black/5 px-4 py-2.5 text-[12px] font-medium text-ink-soft transition-all hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                    >
                      {publishLoading ? (
                        <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">cloud_off</span>
                      )}
                      {publishLoading ? "Unpublishing…" : "Unpublish"}
                    </button>
                    {publishError && (
                      <p className="text-[11px] text-danger">{publishError}</p>
                    )}
                  </div>
                ) : (
                  /* Draft state — subdomain input + publish button */
                  <div className="flex flex-col gap-3">
                    <div className="text-[11px] text-ink-soft leading-relaxed">
                      Choose a subdomain to make your portfolio live.
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center overflow-hidden rounded-[0.75rem] ring-1 ring-black/10 focus-within:ring-accent transition-all">
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => {
                            setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                            setPublishError(null);
                          }}
                          placeholder="your-name"
                          className="flex-1 bg-white px-3 py-2 text-[12px] font-medium text-ink placeholder:text-ink-faint focus:outline-none"
                        />
                        <span className="shrink-0 bg-black/5 px-2 py-2 text-[11px] text-ink-faint">
                          .{domain}
                        </span>
                      </div>
                      {publishError && publishError !== "subscription_required" && (
                        <p className="text-[11px] text-danger">{publishError}</p>
                      )}
                    </div>

                    {publishError === "subscription_required" ? (
                      <div className="flex flex-col gap-2 rounded-[0.75rem] bg-accent/5 p-3 ring-1 ring-accent/20">
                        <p className="text-[11px] text-ink leading-relaxed">
                          Publishing requires an active subscription.
                        </p>
                        <a
                          href={`/${locale}/dashboard/billing`}
                          className="flex items-center justify-center gap-1.5 rounded-[0.75rem] bg-accent px-3 py-2 text-[12px] font-bold text-white transition-all hover:scale-105 hover:shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                          Subscribe
                        </a>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePublish}
                        disabled={publishLoading || !subdomain}
                        className="flex w-full items-center justify-center gap-1.5 rounded-[1rem] bg-ink px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#1a1a1a] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {publishLoading ? (
                          <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                        )}
                        {publishLoading ? "Publishing…" : "Publish"}
                      </button>
                    )}
                  </div>
                )}
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
