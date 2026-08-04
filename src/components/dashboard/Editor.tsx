"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAutosave } from "@/hooks/useAutosave";
import { saveDraftAction, publishProjectAction, unpublishProjectAction, syncFromProfileAction } from "@/lib/projects/actions";
import { FONT_OPTIONS, ACCENT_COLOR_PRESETS, type TemplateId } from "@/templates/types";
import type { BasePortfolioData } from "@/templates/shared/_base";
import type { StudioData } from "@/templates/definitions/studio/schema";
import type { PortfolioProData } from "@/templates/definitions/portfolio-pro/schema";
import type { FreelancerData } from "@/templates/definitions/freelancer/schema";
import type { WebsiteDocument } from "@/templates/definition";
import { PreviewTemplateRenderer as TemplateRenderer, getDefinition } from "@/templates/registry";

// Portfolio Form Sections
import { ProfileSection } from "@/components/portfolio/sections/ProfileSection";
import { ExperienceSection } from "@/components/portfolio/sections/ExperienceSection";
import { EducationSection } from "@/components/portfolio/sections/EducationSection";
import { SkillsSection } from "@/components/portfolio/sections/SkillsSection";
import { ProjectsSection } from "@/components/portfolio/sections/ProjectsSection";
import { ContactSection } from "@/components/portfolio/sections/ContactSection";
import { SocialsSection } from "@/components/portfolio/sections/SocialsSection";
import { StudioHeroSection, StudioExpertiseSection, StudioTestimonialsSection } from "@/templates/definitions/studio/Sections";
import {
  PortfolioProHeroSection,
  PortfolioProAboutSection,
  PortfolioProSkillsSection,
  PortfolioProExperienceSection,
  PortfolioProEducationSection,
  PortfolioProCaseStudiesSection,
  PortfolioProCertificatesSection,
  PortfolioProGallerySection,
} from "@/templates/definitions/portfolio-pro/Sections";
import {
  FreelancerPricingSection,
  FreelancerTestimonialsSection,
} from "@/templates/definitions/freelancer/Sections";

// `studio` and `portfolio-pro` both declare a `hero` field with incompatible
// shapes, so a plain `Partial<StudioData> & Partial<PortfolioProData>`
// intersection is unsatisfiable — union the one field that collides instead.
type EditorData = BasePortfolioData &
  Partial<Omit<StudioData, "hero">> &
  Partial<Omit<PortfolioProData, "hero">> &
  Partial<Omit<FreelancerData, "profile" | "contact" | "socials" | "theme" | "skills" | "projects" | "testimonials">> & {
    hero?: StudioData["hero"] | PortfolioProData["hero"];
  };

export function Editor({
  projectId,
  initialDocument,
  initialTemplateId,
  initialSubdomain,
  initialStatus,
  profileDiverged,
  rootDomain,
}: {
  projectId: string;
  initialDocument: WebsiteDocument;
  initialTemplateId: TemplateId;
  initialSubdomain?: string | null;
  initialStatus?: "draft" | "published";
  profileDiverged?: boolean;
  rootDomain?: string;
}) {
  const [data, setData] = useState<EditorData>(
    (initialDocument.data ?? {}) as EditorData,
  );
  const templateId = initialTemplateId;
  const [showDesktopPreview, setShowDesktopPreview] = useState(false);

  // Tab States
  const [activeLeftTab, setActiveLeftTab] = useState<"content" | "sections">("content");
  const [activeRightTab, setActiveRightTab] = useState<"design" | "settings">("design");

  // Auto-scaling Preview State
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1100);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const desktopTargetWidth = 1280;
  const desktopScale = Math.min(containerWidth / desktopTargetWidth, 1);
  const zoomLevel = Math.round(desktopScale * 100);

  // Profile sync banner state
  const [showProfileBanner, setShowProfileBanner] = useState(profileDiverged ?? false);
  const [syncingProfile, setSyncingProfile] = useState(false);

  async function handleSyncProfile() {
    setSyncingProfile(true);
    const result = await syncFromProfileAction(projectId);
    setSyncingProfile(false);
    if (result.ok) {
      setShowProfileBanner(false);
      window.location.reload();
    }
  }

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

  const definition = getDefinition(templateId);
  const sectionIds = definition?.sections.map((s) => s.id) || [];
  const hasSection = (id: string) => sectionIds.includes(id);

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

  const siteUrl = `${domain}/sites/${subdomain}`;

  return (
    <div className="flex h-full w-full overflow-hidden bg-surface text-ink font-sans">
      
      {/* Full-Height Left Icon Dock */}
      <aside className="w-[64px] shrink-0 border-r border-black/5 bg-surface flex flex-col items-center py-4 justify-between z-30">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Back Arrow - Now in Icon Dock top */}
          <a
            href={`/${locale}/dashboard`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-black/5 hover:text-ink mb-2"
            aria-label="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </a>
          
          <div className="w-8 h-px bg-black/5 mb-2" />

          <button className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-accent/10 text-accent transition-all" title="Content Layers">
             <span className="material-symbols-outlined text-[20px]">layers</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-[12px] text-ink-soft hover:bg-black/5 hover:text-ink transition-all" title="Database">
             <span className="material-symbols-outlined text-[20px]">database</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-[12px] text-ink-soft hover:bg-black/5 hover:text-ink transition-all" title="Media">
             <span className="material-symbols-outlined text-[20px]">image</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-[12px] text-ink-soft hover:bg-black/5 hover:text-ink transition-all" title="Code Customization">
             <span className="material-symbols-outlined text-[20px]">code</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-[12px] text-ink-soft hover:bg-black/5 hover:text-ink transition-all" title="Global Settings">
             <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>

        {/* Bottom Profile Avatar */}
        <div className="flex flex-col items-center gap-4">
           <button className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
             N
           </button>
        </div>
      </aside>

      {/* Main Right Area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top Header */}
        <header className="gsap-header relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-black/5 bg-surface px-6 shadow-sm">
          <div className="flex items-center gap-2 w-1/3">
            <span className="material-symbols-outlined text-[16px] text-ink-soft">arrow_back</span>
            <span className="text-[13px] font-medium text-ink-soft">Back to dashboard</span>
          </div>
          
          <div className="flex items-center justify-center gap-6 w-1/3">
            <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
              <button type="button" className="w-8 h-6 rounded-full bg-white shadow-sm text-accent flex items-center justify-center transition-all"><span className="material-symbols-outlined text-[16px]">desktop_windows</span></button>
              <button type="button" className="w-8 h-6 rounded-full text-ink-soft hover:text-ink flex items-center justify-center transition-all"><span className="material-symbols-outlined text-[16px]">tablet_mac</span></button>
              <button type="button" className="w-8 h-6 rounded-full text-ink-soft hover:text-ink flex items-center justify-center transition-all"><span className="material-symbols-outlined text-[16px]">smartphone</span></button>
            </div>
            
            <div className="flex items-center gap-1">
              <button type="button" className="w-8 h-8 rounded-lg text-ink-faint hover:text-ink hover:bg-black/5 flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">undo</span></button>
              <button type="button" className="w-8 h-8 rounded-lg text-ink-faint hover:text-ink hover:bg-black/5 flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">redo</span></button>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-positive">check</span>
              <span className="text-[12px] font-medium text-positive">{tSaveStatus(saveStatus)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-1/3">
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
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-4 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              Preview
            </button>
            <button
              onClick={() => saveDraftAction(projectId, documentForSave())}
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-4 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[14px]">save</span>
              Save
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab("settings")}
              className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-1.5 text-[12px] font-medium text-white shadow-sm transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
              Publish
            </button>
          </div>
        </header>

        {/* 3-Column Workspace */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left Sidebar: Content & Sections */}
        <aside className="gsap-panel flex w-[300px] shrink-0 flex-col border-r border-black/5 bg-surface z-20 shadow-md">
          <div className="flex h-[52px] shrink-0 items-end px-5 border-b border-black/5 gap-6">
            <button
              onClick={() => setActiveLeftTab("content")}
              className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                activeLeftTab === "content" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveLeftTab("sections")}
              className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                activeLeftTab === "sections" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Sections
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            {activeLeftTab === "content" ? (
            <div className="flex flex-col h-full justify-between pb-6">
              <div className="flex flex-col gap-3">
                {/* Projects Card (Active) */}
                <div className="flex items-center justify-between rounded-[1rem] bg-accent/5 ring-1 ring-accent p-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-accent shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">work</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-ink">Projects</span>
                      <span className="text-[11px] text-ink-soft">3 items</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-ink-faint cursor-grab">drag_indicator</span>
                </div>

                {/* About me Card */}
                <div className="flex items-center justify-between rounded-[1rem] bg-white ring-1 ring-black/5 p-3 cursor-pointer hover:bg-black/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-ink-soft shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-ink">About me</span>
                      <span className="text-[11px] text-ink-soft">1 item</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-ink-faint cursor-grab">drag_indicator</span>
                </div>

                {/* Contact Card */}
                <div className="flex items-center justify-between rounded-[1rem] bg-white ring-1 ring-black/5 p-3 cursor-pointer hover:bg-black/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-ink-soft shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-ink">Contact</span>
                      <span className="text-[11px] text-ink-soft">3 items</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-ink-faint cursor-grab">drag_indicator</span>
                </div>

                {/* Social links Card */}
                <div className="flex items-center justify-between rounded-[1rem] bg-white ring-1 ring-black/5 p-3 cursor-pointer hover:bg-black/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-ink-soft shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">link</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-ink">Social links</span>
                      <span className="text-[11px] text-ink-soft">5 items</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-ink-faint cursor-grab">drag_indicator</span>
                </div>

                {/* Add Section Button */}
                <button className="flex items-center justify-center gap-2 mt-2 w-full rounded-[1rem] border-2 border-dashed border-accent/20 py-3 text-[13px] font-bold text-accent transition-all hover:bg-accent/5 hover:border-accent/40">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add section
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                {/* Site Status Card */}
                <div className="flex flex-col rounded-[1rem] bg-white ring-1 ring-black/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-positive"></div>
                    <span className="text-[13px] font-bold text-ink">Ready to publish</span>
                  </div>
                  <p className="text-[11px] text-ink-soft leading-relaxed mb-4">
                    Your portfolio looks great! Don't forget to preview it on mobile.
                  </p>
                  <button className="flex items-center justify-center gap-1.5 w-full rounded-full bg-black/5 py-2 text-[12px] font-bold text-ink transition-all hover:bg-black/10">
                    <span className="material-symbols-outlined text-[16px]">smartphone</span>
                    Preview on mobile
                  </button>
                </div>

                {/* Profile Avatar (Bottom) */}
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-black/5 cursor-pointer hover:bg-black/5 rounded-lg p-2 transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated ring-1 ring-black/10 flex items-center justify-center overflow-hidden">
                       <img src="https://api.dicebear.com/7.x/notionists/svg?seed=maaulln" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-ink">maaulln</span>
                      <span className="text-[11px] text-ink-soft">maaulln@gmail.com</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-ink-soft">expand_more</span>
                </div>
              </div>
            </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <span className="material-symbols-outlined text-[32px] text-ink-faint mb-3">layers</span>
                <span className="text-[13px] font-bold text-ink mb-1">Manage Sections</span>
                <span className="text-[12px] text-ink-soft">Reorder and toggle sections visibility here.</span>
              </div>
            )}
          </div>
        </aside>

        {/* Center Canvas: Preview Area */}
        <main className="relative flex flex-1 flex-col overflow-y-auto bg-canvas p-6 scrollbar-thin md:p-8 flex items-center">
          <div className="flex w-full justify-between items-center max-w-[1280px] mb-4 shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-positive" />
                <span className="text-[12px] font-bold text-ink-soft">Live preview</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm ring-1 ring-black/5">
                 <button className="w-6 h-6 rounded-full flex items-center justify-center text-ink-soft hover:text-ink"><span className="material-symbols-outlined text-[14px]">light_mode</span></button>
                 <button className="w-6 h-6 rounded-full flex items-center justify-center text-ink-soft hover:text-ink"><span className="material-symbols-outlined text-[14px]">dark_mode</span></button>
               </div>
               <div className="bg-white rounded-full px-3 py-1.5 shadow-sm ring-1 ring-black/5 flex items-center gap-1 cursor-pointer">
                 <span className="text-[11px] font-bold text-ink">{zoomLevel}%</span>
                 <span className="material-symbols-outlined text-[14px] text-ink-soft">expand_more</span>
               </div>
             </div>
          </div>
          
          <div 
            ref={containerRef}
            className="flex-1 w-full max-w-[1280px] flex justify-center rounded-[2rem] overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 relative min-h-0"
          >
            <div
              className="overflow-y-auto overflow-x-hidden scrollbar-thin transition-transform duration-300 origin-top shrink-0"
              style={{
                width: "1280px", // Always 1280px to force desktop media queries
                height: `${100 / desktopScale}%`, // Counter-scale height so inner content has full scroll area
                transform: `scale(${desktopScale})`, // Scale down visually to fit container
              }}
            >
              <TemplateRenderer templateId={templateId} data={data} />
            </div>
          </div>
        </main>

        {/* Right Sidebar: Design Properties + Publish */}
        <aside className="gsap-panel flex w-[280px] shrink-0 flex-col border-l border-black/5 bg-surface z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex h-[52px] shrink-0 items-end px-5 border-b border-black/5 gap-6">
            <button
              onClick={() => setActiveRightTab("design")}
              className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                activeRightTab === "design" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveRightTab("settings")}
              className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                activeRightTab === "settings" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Settings
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            {activeRightTab === "design" ? (
            <div className="flex flex-col gap-8 pb-6">

              {/* Theme Section */}
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold text-ink">Theme</span>
                <div className="grid grid-cols-6 gap-2">
                  {/* Active Purple */}
                  <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white cursor-pointer ring-2 ring-offset-2 ring-[#7c3aed]">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  {/* Other Colors */}
                  <div className="w-8 h-8 rounded-full bg-[#ef4444] cursor-pointer hover:scale-110 transition-transform"></div>
                  <div className="w-8 h-8 rounded-full bg-[#10b981] cursor-pointer hover:scale-110 transition-transform"></div>
                  <div className="w-8 h-8 rounded-full bg-[#f97316] cursor-pointer hover:scale-110 transition-transform"></div>
                  <div className="w-8 h-8 rounded-full bg-[#a855f7] cursor-pointer hover:scale-110 transition-transform"></div>
                  <div className="w-8 h-8 rounded-full bg-[#3b82f6] cursor-pointer hover:scale-110 transition-transform"></div>
                </div>
              </div>

              {/* Typography Section */}
              <div className="flex flex-col gap-4">
                <span className="text-[12px] font-bold text-ink">Typography</span>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-ink-soft">Font family</span>
                  <div className="flex items-center justify-between rounded-lg bg-white ring-1 ring-black/5 px-3 py-2 cursor-pointer hover:bg-black/5 transition-colors">
                    <span className="text-[12px] font-medium text-ink">Inter</span>
                    <span className="material-symbols-outlined text-[16px] text-ink-soft">expand_more</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-ink-soft">Heading font</span>
                  <div className="flex items-center justify-between rounded-lg bg-white ring-1 ring-black/5 px-3 py-2 cursor-pointer hover:bg-black/5 transition-colors">
                    <span className="text-[12px] font-medium text-ink">Plus Jakarta Sans</span>
                    <span className="material-symbols-outlined text-[16px] text-ink-soft">expand_more</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-ink-soft">Base font</span>
                  <div className="flex bg-black/5 rounded-lg p-1">
                     <button className="flex-1 bg-white rounded-md py-1.5 text-[11px] font-bold text-accent shadow-sm">Sans (Modern)</button>
                     <button className="flex-1 rounded-md py-1.5 text-[11px] font-medium text-ink-soft hover:text-ink">Serif (Classic)</button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-ink-soft">Mono font</span>
                  <div className="flex items-center justify-between rounded-lg bg-white ring-1 ring-black/5 px-3 py-2 cursor-pointer hover:bg-black/5 transition-colors">
                    <span className="text-[12px] font-medium text-ink">JetBrains Mono</span>
                    <span className="material-symbols-outlined text-[16px] text-ink-soft">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Spacing Section */}
              <div className="flex flex-col gap-4">
                <span className="text-[12px] font-bold text-ink">Spacing</span>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-ink-soft">Content width</span>
                    <span className="text-[11px] font-bold text-ink">1280px</span>
                  </div>
                  <div className="h-1.5 bg-black/10 rounded-full relative">
                    <div className="absolute top-0 left-0 h-full bg-accent rounded-full w-[60%]"></div>
                    <div className="absolute top-1/2 left-[60%] -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white ring-2 ring-accent rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-ink-soft">Section spacing</span>
                    <span className="text-[11px] font-bold text-ink">64px</span>
                  </div>
                  <div className="h-1.5 bg-black/10 rounded-full relative">
                    <div className="absolute top-0 left-0 h-full bg-accent rounded-full w-[40%]"></div>
                    <div className="absolute top-1/2 left-[40%] -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white ring-2 ring-accent rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>

              {/* Radius / Shadows Section */}
              <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-bold text-ink">Radius</span>
                       <span className="text-[11px] font-bold text-ink">20px</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="w-10 h-10 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center hover:bg-black/5 transition-colors">
                          <div className="w-5 h-5 border-2 border-ink-soft rounded-none"></div>
                       </button>
                       <button className="w-10 h-10 rounded-lg bg-accent/5 ring-1 ring-accent flex items-center justify-center text-accent">
                          <div className="w-5 h-5 border-2 border-accent rounded-[6px]"></div>
                       </button>
                       <button className="w-10 h-10 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center hover:bg-black/5 transition-colors">
                          <div className="w-5 h-5 border-2 border-ink-soft rounded-[10px]"></div>
                       </button>
                       <button className="w-10 h-10 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center hover:bg-black/5 transition-colors">
                          <div className="w-5 h-5 border-2 border-ink-soft rounded-full"></div>
                       </button>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-bold text-ink">Shadows</span>
                    <div className="flex items-center gap-2">
                       <button className="w-10 h-10 rounded-lg bg-accent/5 ring-1 ring-accent flex items-center justify-center text-accent">
                          <div className="w-5 h-5 border border-accent bg-white shadow-sm"></div>
                       </button>
                       <button className="w-10 h-10 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center hover:bg-black/5 transition-colors">
                          <div className="w-5 h-5 border border-ink-soft bg-white shadow-md"></div>
                       </button>
                       <button className="w-10 h-10 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center hover:bg-black/5 transition-colors">
                          <div className="w-5 h-5 border border-ink-soft bg-white shadow-lg"></div>
                       </button>
                       <button className="w-10 h-10 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center hover:bg-black/5 transition-colors">
                          <div className="w-5 h-5 border border-ink-soft bg-white shadow-xl"></div>
                       </button>
                    </div>
                 </div>
              </div>

            </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <span className="material-symbols-outlined text-[32px] text-ink-faint mb-3">settings</span>
                <span className="text-[13px] font-bold text-ink mb-1">General Settings</span>
                <span className="text-[12px] text-ink-soft">SEO and custom domain settings will be available here.</span>
              </div>
            )}
          </div>
        </aside>
      </div>
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
