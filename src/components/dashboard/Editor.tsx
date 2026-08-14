/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAutosave } from "@/hooks/useAutosave";
import {
  saveDraftAction,
  publishProjectAction,
  unpublishProjectAction,
  syncFromProfileAction,
  listProjectVersionsAction,
  restoreProjectVersionAction,
} from "@/lib/projects/actions";
import { FONT_OPTIONS, ACCENT_COLOR_PRESETS, type TemplateId } from "@/templates/types";
import type { BasePortfolioData } from "@/templates/shared/_base";
import type { StudioData } from "@/templates/definitions/studio/schema";
import type { PortfolioProData } from "@/templates/definitions/portfolio-pro/schema";
import type { FreelancerData } from "@/templates/definitions/freelancer/schema";
import { WebsiteDocument } from "@/templates/definition";
import { PreviewTemplateRenderer as TemplateRenderer, getDefinition } from "@/templates/registry";
import { useHistory } from "@/hooks/useHistory";
import { useToast } from "@/components/ui/Toast";

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

type ReadinessIssue = {
  id: string;
  label: string;
  detail: string;
};

type VersionListItem = {
  id: string;
  versionNumber: number;
  createdAt: string;
  isAutosave: boolean;
};

export function Editor({
  projectId,
  workspaceId,
  initialDocument,
  initialPublishedDocument,
  initialTemplateId,
  initialSubdomain,
  initialStatus,
  profileDiverged,
  rootDomain,
}: {
  projectId: string;
  workspaceId?: string;
  initialDocument: WebsiteDocument;
  initialPublishedDocument?: WebsiteDocument | null;
  initialTemplateId: TemplateId;
  initialSubdomain?: string | null;
  initialStatus?: "draft" | "published";
  profileDiverged?: boolean;
  rootDomain?: string;
}) {
  const [data, setData, history] = useHistory<EditorData>(
    (initialDocument.data ?? {}) as EditorData,
  );
  const templateId = initialTemplateId;
  const [showDesktopPreview, setShowDesktopPreview] = useState(false);

  // Tab States
  const [activeLeftTab, setActiveLeftTab] = useState<"content" | "sections">("content");
  const [activeRightTab, setActiveRightTab] = useState<"appearance" | "settings">("appearance");
  
  // Accordion State
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeSectionFields, setActiveSectionFields] = useState<{id: string, label: string}[]>([]);
  
  // Publish Readiness State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishErrors, setPublishErrors] = useState<ReadinessIssue[]>([]);

  // Publish dialog state
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Quick Action Toolbar State
  const [hoveredActionCard, setHoveredActionCard] = useState<{
    sectionType: string;
    index: number;
    rect: DOMRect;
  } | null>(null);

  // Viewport Simulation State
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "laptop" | "tablet" | "mobile">("desktop");
  const [previewZoom, setPreviewZoom] = useState<"fit-screen" | "25" | "50" | "100">("fit-screen");

  // Mobile drawer state (sidebars become drawers below lg breakpoint)
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // SEO settings (persisted in WebsiteDocument.meta.seo)
  const [seo, setSeo] = useState<{ title?: string; description?: string; ogImage?: string }>(
    initialDocument.meta?.seo ?? {},
  );


  const DEVICE_CONFIG = {
    desktop: { width: 1440, height: 900, name: "Desktop" },
    laptop: { width: 1280, height: 800, name: "Laptop" },
    tablet: { width: 768, height: 1024, name: "Tablet" },
    mobile: { width: 390, height: 844, name: "Mobile" },
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null); // New ref for the scrollable frame
  const [containerSize, setContainerSize] = useState({ width: 1100, height: 800 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const device = DEVICE_CONFIG[previewDevice];
  
  // Panning state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Calculate fit scales
  const isDesktopOrLaptop = ["desktop", "laptop"].includes(previewDevice);
  const padding = isDesktopOrLaptop ? 0 : 64;
  const availableW = Math.max(containerSize.width - padding * 2, 100);

  const scaleFitWidth = availableW / device.width;
  
  let scale = 1;
  if (previewZoom === "fit-screen") scale = scaleFitWidth;
  else scale = parseInt(previewZoom) / 100;
  
  // Dynamic height for Desktop/Laptop so it spans the full vertical workspace
  const computedHeight = isDesktopOrLaptop ? containerSize.height / scale : device.height;

  const zoomLevel = Math.round(scale * 100);

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

  // Last published snapshot (B-4: draft vs published diff + revert)
  const [publishedDocument, setPublishedDocument] = useState<WebsiteDocument | null>(
    initialPublishedDocument ?? null,
  );
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [revertLoading, setRevertLoading] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<VersionListItem[]>([]);
  const [versionHistoryLoading, setVersionHistoryLoading] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  const draftDiverged =
    publishStatus === "published" &&
    !!publishedDocument &&
    (JSON.stringify(publishedDocument.data) !== JSON.stringify(data) ||
      JSON.stringify(publishedDocument.meta?.seo ?? {}) !== JSON.stringify(seo));

  function handleRevertToLive() {
    if (!publishedDocument) return;
    setRevertLoading(true);
    // Restore draft + SEO to the last published snapshot; autosave persists it.
    setData((publishedDocument.data ?? {}) as EditorData);
    setSeo(publishedDocument.meta?.seo ?? {});
    setRevertLoading(false);
    setShowRevertDialog(false);
    setPublishStatus("published");
    showToast("Draft dikembalikan ke versi yang live.", "info");
  }

  async function handleOpenVersionHistory() {
    setShowVersionHistory(true);
    setVersionHistoryLoading(true);
    try {
      const versions = await listProjectVersionsAction(projectId);
      setVersionHistory(
        versions.map((version) => ({
          id: version.id,
          versionNumber: version.versionNumber,
          createdAt: version.createdAt,
          isAutosave: version.isAutosave,
        })),
      );
    } catch {
      showToast("Riwayat versi tidak dapat dimuat.", "error");
    } finally {
      setVersionHistoryLoading(false);
    }
  }

  async function handleRestoreVersion(versionId: string) {
    setRestoringVersionId(versionId);
    try {
      const result = await restoreProjectVersionAction(projectId, versionId);
      if (!result.ok || !result.document) {
        showToast(result.error ?? "Versi tidak dapat dipulihkan.", "error");
        return;
      }
      setData((result.document.data ?? {}) as EditorData);
      setSeo(result.document.meta?.seo ?? {});
      setShowVersionHistory(false);
      showToast("Versi berhasil dipulihkan sebagai draft baru.", "success");
    } catch {
      showToast("Versi tidak dapat dipulihkan.", "error");
    } finally {
      setRestoringVersionId(null);
    }
  }

  function readinessIssues(): ReadinessIssue[] {
    const issues: ReadinessIssue[] = [];
    if (!data.profile?.fullName) {
      issues.push({ id: "profile", label: "Tambahkan nama lengkap", detail: "Nama akan menjadi judul utama website." });
    }
    if (!data.profile?.headline) {
      issues.push({ id: "profile", label: "Tambahkan headline", detail: "Jelaskan peran atau keahlian utama kamu." });
    }
    if (!data.profile?.photoUrl) {
      issues.push({ id: "profile", label: "Upload foto profil", detail: "Foto membantu pengunjung mengenali kamu." });
    }
    if (!data.projects?.length) {
      issues.push({ id: "projects", label: "Tambahkan minimal satu project", detail: "Tampilkan karya terbaikmu sebelum publish." });
    }
    if (!data.contact?.email) {
      issues.push({ id: "contact", label: "Tambahkan email kontak", detail: "Pengunjung membutuhkan cara untuk menghubungi kamu." });
    }
    return issues;
  }

  function goToReadinessIssue(issue: ReadinessIssue) {
    setShowPublishModal(false);
    setActiveLeftTab("content");
    setExpandedSection(issue.id);
  }

  const domain = rootDomain ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

  const scrollToSection = (sectionKey: string) => {
    if (sectionKey === "about" || sectionKey === "profile" || sectionKey === "hero") {
      // Scroll to the top for the "About me" or "Profile" section
      if (previewScrollRef.current) {
        previewScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    
    // Map some schema IDs to minimal/portfolio-pro renderer's data-section-key or element IDs
    let query = `[data-section-key="${sectionKey}"], #${sectionKey}`;
    
    if (["projects", "caseStudies"].includes(sectionKey)) {
      query = `[data-section-key="${sectionKey}"], #${sectionKey}, [data-section-key="work"], #work, #projects`;
    } else if (["skills", "skillsShowcase", "experienceDetails", "educationDetails"].includes(sectionKey)) {
      query = `[data-section-key="${sectionKey}"], #${sectionKey}, [data-section-key="capabilities"], #capabilities, #skills, #resume`;
    } else if (sectionKey === "certificates") {
      query = `[data-section-key="${sectionKey}"], #${sectionKey}, #courses`;
    } else if (sectionKey === "gallery") {
      query = `[data-section-key="${sectionKey}"], #${sectionKey}, #activities`;
    }

    // Find the element by data-section-key or id
    const element = document.querySelector(query);
    if (element) {
      if (previewScrollRef.current && element instanceof HTMLElement) {
        // Bounding rectangles are scaled by the CSS transform, so we divide by the scale factor
        const containerRect = previewScrollRef.current.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate top offset relative to the container, unscaled
        const relativeTop = (elementRect.top - containerRect.top) / scale;
        
        previewScrollRef.current.scrollTo({ 
          top: previewScrollRef.current.scrollTop + relativeTop, 
          behavior: "smooth" 
        });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Canvas Panning Handlers
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default scrolling on the workspace if it's scrollable, but we handle it via state
    setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
  };

  const handleWorkspaceMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'workspace-canvas') {
      setIsPanning(true);
    }
  };

  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  const handleWorkspaceMouseUp = () => {
    setIsPanning(false);
  };

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const itemEl = target.closest("[data-section-type][data-item-index]") as HTMLElement;
    
    if (itemEl && previewScrollRef.current) {
      const rect = itemEl.getBoundingClientRect();
      const containerRect = previewScrollRef.current.getBoundingClientRect();
      
      setHoveredActionCard({
        sectionType: itemEl.getAttribute("data-section-type")!,
        index: parseInt(itemEl.getAttribute("data-item-index")!, 10),
        rect: {
          ...rect,
          top: (rect.top - containerRect.top) / scale,
          left: (rect.left - containerRect.left) / scale,
          width: rect.width / scale,
          height: rect.height / scale,
        } as DOMRect
      });
    }
  };

  const handlePreviewMouseLeave = () => {
    setHoveredActionCard(null);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    
    const sectionElement = target.closest("section, header, footer, [data-section-key]");
    if (sectionElement) {
      let sectionId = sectionElement.id || sectionElement.getAttribute("data-section-key");
      
      if (sectionId) {
        if (sectionId === "work") sectionId = "projects";
        if (sectionId === "capabilities") sectionId = "skills";
        if (sectionId === "resume") sectionId = "experienceDetails"; 
        if (sectionId === "courses") sectionId = "certificates";
        if (sectionId === "activities") sectionId = "gallery";
        
        const validSection = definition?.sections.find(
          s => s.id === sectionId || s.id === sectionElement.id || s.id === sectionElement.getAttribute("data-section-key")
        );
        
        if (validSection) {
          setExpandedSection(validSection.id);
          // Scroll left panel to the expanded accordion after a short delay
          setTimeout(() => {
            const accordionEl = document.getElementById(`accordion-${validSection.id}`);
            if (accordionEl) {
              accordionEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100);
        }
      }
    }
  };

  // Build a WebsiteDocument from current data state for autosave
  const documentForSave = (): WebsiteDocument => ({
    ...initialDocument,
    meta: {
      ...initialDocument.meta,
      templateId: templateId,
      updatedAt: new Date().toISOString(),
      ...(seo.title || seo.description || seo.ogImage ? { seo } : {}),
    },
    data: data as Record<string, unknown>,
  });

  const [customSaveStatus, setCustomSaveStatus] = useState<"Saving..." | "Saved just now" | "✓ All changes saved" | "Error saving" | "">("");

  useAutosave({ data, seo }, async (d) => {
    setCustomSaveStatus("Saving...");
    try {
      const result = await saveDraftAction(projectId, documentForSave());
      setCustomSaveStatus("Saved just now");
      setTimeout(() => setCustomSaveStatus("✓ All changes saved"), 2000);
      return result;
    } catch (e) {
      console.error(e);
      setCustomSaveStatus("Error saving");
      return { ok: false };
    }
  });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when user is typing in native inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }
      
      if (e.key === 'Escape') {
        setExpandedSection(null);
      }
      
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      

      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          history.redo();
        } else {
          history.undo();
        }
      }
      
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        // UI feedback trigger, actual save handled by autosave throttle
        setCustomSaveStatus("Saved just now");
        setTimeout(() => setCustomSaveStatus("✓ All changes saved"), 2000);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history]);

  const { showToast } = useToast();
  const t = useTranslations("TemplatePicker");
  const tEditor = useTranslations("Editor");
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
      // Refresh the published snapshot so the divergence banner clears.
      setPublishedDocument(documentForSave());
      setShowPublishDialog(false);
      showToast("Website berhasil dipublikasikan!", "success");
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
      showToast("Website di-unpublish. Data tetap tersimpan.", "info");
    } else {
      setPublishError(result.error ?? "Failed to unpublish.");
    }
  }

  // Normalize subdomain input: lowercase, keep only [a-z0-9-], max 63 chars
  function sanitizeSubdomain(raw: string) {
    return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 63);
  }

  const siteUrl = `${domain}/sites/${subdomain}`;

  return (
    <div className="flex h-full w-full overflow-hidden bg-surface text-ink font-sans">
      
      {/* Main Right Area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top Header */}
        <header className="gsap-header relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-black/5 bg-surface px-3 sm:px-6 shadow-sm">
          <a
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 w-1/3 text-ink-soft hover:text-ink transition-colors cursor-pointer"
            aria-label={tEditor("backToDashboard")}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="text-[13px] font-medium hidden sm:inline">{tEditor("backToDashboard")}</span>
          </a>
          
          <div className="flex items-center justify-center w-1/3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-positive">check</span>
              <span className="text-[12px] font-medium text-positive">{customSaveStatus}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-1/3">
            {/* Explicit draft/live state so users know what is currently public. */}
            {publishStatus === "published" && subdomain ? (
              <a
                href={`http://${siteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-positive/10 px-3 py-1 text-[11px] font-bold text-positive hover:bg-positive/20 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                {tEditor("live")}
              </a>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1 text-[11px] font-bold text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
                {tEditor("draftOnly")}
              </span>
            )}
            <button
              type="button"
              onClick={handleOpenVersionHistory}
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-3 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5"
              aria-label={tEditor("versions")}
            >
              <span className="material-symbols-outlined text-[14px]">history</span>
              <span className="hidden xl:inline">{tEditor("versions")}</span>
            </button>
            <button
              onClick={() => setShowDesktopPreview(true)}
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-4 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              <span className="hidden sm:inline">{tEditor("preview")}</span>
            </button>
            <button
              onClick={() => saveDraftAction(projectId, documentForSave())}
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-4 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[14px]">save</span>
              <span className="hidden sm:inline">{tEditor("save")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const missing = readinessIssues();
                if (missing.length > 0) {
                  setPublishErrors(missing);
                  setShowPublishModal(true);
                } else {
                  setPublishError(null);
                  setShowPublishDialog(true);
                }
              }}
              className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-1.5 text-[12px] font-medium text-white shadow-sm transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
              {tEditor("publish")}
            </button>
          </div>
        </header>

        {/* Profile Sync Banner (A-3: FLOW 4 step K–N) */}
        {showProfileBanner && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-warning/20 bg-warning-soft px-6 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-warning">sync</span>
              <span className="text-[13px] font-medium text-warning">
                {tEditor("profileSyncMsg")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowProfileBanner(false)}
                className="rounded-full px-3 py-1 text-[12px] font-medium text-warning transition-colors hover:bg-warning/10"
              >
                {tEditor("ignore")}
              </button>
              <button
                type="button"
                disabled={syncingProfile}
                onClick={handleSyncProfile}
                className="flex items-center gap-1.5 rounded-full bg-warning px-4 py-1 text-[12px] font-semibold text-white transition-colors hover:bg-warning/90 disabled:opacity-60"
              >
                {syncingProfile ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {tEditor("syncing")}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    {tEditor("syncFromProfile")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Draft vs Published divergence banner (B-4) */}
        {draftDiverged && !showProfileBanner && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-info/20 bg-info-soft px-6 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-info">published_with_changes</span>
              <span className="text-[13px] font-medium text-info">
                {tEditor("divergenceMsg")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowRevertDialog(true)}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1 text-[12px] font-semibold text-info ring-1 ring-info/20 transition-colors hover:bg-info/10"
              >
                <span className="material-symbols-outlined text-[14px]">undo</span>
                {tEditor("revertToLive")}
              </button>
            </div>
          </div>
        )}

        {/* 3-Column Workspace */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left Sidebar: Content & Sections */}
        <aside className={`fixed inset-y-0 left-0 z-30 flex w-[300px] shrink-0 flex-col border-r border-black/5 bg-surface shadow-md transition-transform duration-300 ease-out lg:static lg:z-auto ${mobileLeftOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <>
            <div className="flex h-[52px] shrink-0 items-end px-5 border-b border-black/5 gap-6">
                <button
                  onClick={() => setActiveLeftTab("content")}
                  className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                    activeLeftTab === "content" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {tEditor("contentTab")}
                </button>
                <button
                  onClick={() => setActiveLeftTab("sections")}
                  className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                    activeLeftTab === "sections" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {tEditor("sectionsTab")}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileLeftOpen(false)}
                  className="lg:hidden ml-auto mb-2.5 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-black/5 hover:text-ink transition-colors"
                  aria-label="Close panel"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
                {activeLeftTab === "content" ? (
                <div className="flex flex-col h-full overflow-y-auto scrollbar-thin pb-6 pr-2 relative">
                  
                  {/* Sticky Context Header */}
                  <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md pb-4 pt-1 mb-4 border-b border-black/5 -mt-2">
                    <span className="text-[10px] font-bold text-ink-soft uppercase tracking-[0.05em]">
                      {expandedSection ? tEditor("editing") : tEditor("selectToEdit")}
                    </span>
                    <h2 className="text-sm font-bold text-ink mt-0.5">
                      {expandedSection 
                        ? (definition?.sections.find(s => s.id === expandedSection)?.label || expandedSection)
                        : tEditor("contentOverview")
                      }
                    </h2>
                  </div>

                  {/* Portfolio Completion Progress */}
                  {(() => {
                    const tasks = [
                      { id: "profile", label: "Add Name", done: !!data.profile?.fullName },
                      { id: "profile", label: "Upload Photo", done: !!data.profile?.photoUrl },
                      { id: "projects", label: "Add a Project", done: !!data.projects?.length },
                      { id: "skills", label: "Add a Skill", done: !!data.skills?.length },
                    ];
                    const completed = tasks.filter(t => t.done).length;
                    const progress = Math.round((completed / tasks.length) * 100);
                    
                    if (progress === 100) return null;
                    
                    return (
                        <div className="flex flex-col gap-3 mb-6 p-4 rounded-[1.5rem] bg-accent/[0.03] border border-accent/10 shadow-sm transition-all">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <h3 className="text-[13px] font-bold text-ink">{tEditor("setupProgress")}</h3>
                              <span className="text-[11px] text-ink-soft">{tEditor("completedOf", { completed, tasks: tasks.length })}</span>
                            </div>
                            <span className="text-[14px] font-black text-accent">{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                            {tasks.filter(t => !t.done).slice(0, 1).map(task => (
                              <button
                                key={task.id}
                                onClick={() => {
                                  setExpandedSection(task.id);
                                }}
                                className="text-[11px] font-bold text-accent/80 hover:text-accent flex items-center justify-between group transition-colors"
                              >
                                <span>{tEditor("next", { label: task.label })}</span>
                                <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0">arrow_forward</span>
                              </button>
                            ))}
                          </div>
                        </div>
                    );
                  })()}

                  <div className="flex flex-col gap-3">
                    {definition?.sections.map((section) => {
                      let icon = "article";
                      let displayLabel = section.label;
                      
                      if (section.id === "profile" || section.id === "hero" || section.id === "about") {
                        icon = "person";
                        if (section.id === "hero") displayLabel = "Introduction";
                        if (section.id === "profile") displayLabel = "Personal Details";
                      }
                      else if (section.id === "projects" || section.id === "work" || section.id === "case-studies" || section.id === "caseStudies") icon = "work";
                      else if (section.id === "contact") icon = "mail";
                      else if (section.id === "socials") icon = "link";
                      else if (section.id === "skills" || section.id === "capabilities" || section.id === "expertise" || section.id === "skillsShowcase") icon = "star";
                      else if (section.id === "experience" || section.id === "experienceDetails") icon = "history";
                      else if (section.id === "education" || section.id === "educationDetails") icon = "school";
                      else if (section.id === "pricing") icon = "payments";
                      else if (section.id === "testimonials") icon = "forum";
                      else if (section.id === "gallery" || section.id === "certificates") icon = "image";

                      const isExpanded = expandedSection === section.id;

                      const renderSectionForm = (sectionId: string) => {
                        // Base sections
                        if (sectionId === "profile" || sectionId === "about") {
                          if (templateId === "portfolio-pro" && sectionId === "about") {
                            return <PortfolioProAboutSection about={data.about!} onChange={patch => setData({ ...data, about: { ...data.about!, ...patch } })} />
                          }
                          return <ProfileSection t={tProfile} description="Tell visitors who you are and what you do." profile={data.profile || { fullName: "", headline: "", bio: "", photoUrl: "", location: "" }} onChange={(patch) => setData({ ...data, profile: { ...(data.profile || {}), ...patch } })} />;
                        }
                        if (sectionId === "hero") {
                          if (templateId === "studio") {
                            return <StudioHeroSection hero={data.hero as StudioData["hero"]} onChange={patch => setData({ ...data, hero: { ...(data.hero as StudioData["hero"]), ...patch } })} />
                          }
                          if (templateId === "portfolio-pro") {
                            return <PortfolioProHeroSection hero={data.hero as PortfolioProData["hero"]} onChange={patch => setData({ ...data, hero: { ...(data.hero as PortfolioProData["hero"]), ...patch } })} />
                          }
                          // Fallback to profile section if hero isn't explicitly defined
                          return <ProfileSection t={tProfile} description="Introduce yourself and set the tone of your portfolio." profile={data.profile || { fullName: "", headline: "", bio: "", photoUrl: "", location: "" }} onChange={(patch) => setData({ ...data, profile: { ...(data.profile || {}), ...patch } })} />;
                        }
                        if (sectionId === "expertise") {
                          return <StudioExpertiseSection expertise={data.expertise || []} onChange={items => setData({ ...data, expertise: items })} />
                        }
                        if (sectionId === "projects" || sectionId === "work") {
                          return (
                            <div className="flex flex-col gap-3">
                              {workspaceId && (
                                <a href={`/${locale}/dashboard/content`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-[1rem] border border-accent/25 bg-accent/[0.04] px-4 py-2.5 text-[12px] font-bold text-accent transition-all hover:bg-accent/[0.08]">
                                  <span className="material-symbols-outlined text-[14px]">database</span>
                                  {tEditor("manageInLibrary")}
                                </a>
                              )}
                              <div className="pointer-events-none opacity-75"><ProjectsSection t={tProjects} items={data.projects || []} onChange={() => undefined} /></div>
                            </div>
                          );
                        }
                        if (sectionId === "caseStudies") {
                          return <PortfolioProCaseStudiesSection items={data.caseStudies || []} onChange={items => setData({ ...data, caseStudies: items })} />
                        }
                        if (sectionId === "skills") {
                          return (
                            <SkillsSection 
                              eyebrow={tSkills("eyebrow")}
                              title={tSkills("title")}
                              description="Help recruiters understand your technical expertise."
                              placeholder={tSkills("placeholder")} // using placeholder as defined in en.json
                              removeLabel={tSkills("removeLabel")}
                              skills={data.skills || []} 
                              onChange={(items) => setData({ ...data, skills: items })} 
                            />
                          );
                        }
                        if (sectionId === "skillsShowcase") {
                          return <PortfolioProSkillsSection items={data.skillsShowcase || []} onChange={items => setData({ ...data, skillsShowcase: items })} />
                        }
                        if (sectionId === "experience") {
                          return <ExperienceSection t={tExperience} items={data.experiences || []} onChange={(items) => setData({ ...data, experiences: items })} />;
                        }
                        if (sectionId === "experienceDetails") {
                          return <PortfolioProExperienceSection items={data.experienceDetails || []} onChange={items => setData({ ...data, experienceDetails: items })} />
                        }
                        if (sectionId === "education") {
                          return <EducationSection t={tEducation} items={data.educations || []} onChange={(items) => setData({ ...data, educations: items })} />;
                        }
                        if (sectionId === "educationDetails") {
                          return <PortfolioProEducationSection items={data.educationDetails || []} onChange={items => setData({ ...data, educationDetails: items })} />
                        }
                        if (sectionId === "certificates") {
                          return <PortfolioProCertificatesSection items={data.certificates || []} onChange={items => setData({ ...data, certificates: items })} />
                        }
                        if (sectionId === "gallery") {
                          return <PortfolioProGallerySection items={data.gallery || []} onChange={items => setData({ ...data, gallery: items })} />
                        }
                        if (sectionId === "testimonials") {
                          if (templateId === "studio") {
                            return <StudioTestimonialsSection testimonials={data.testimonials || []} onChange={testimonials => setData({ ...data, testimonials })} />
                          }
                          return <FreelancerTestimonialsSection testimonials={(data.testimonials || []) as any} onChange={testimonials => setData({ ...data, testimonials: testimonials as any })} />
                        }
                        if (sectionId === "pricing") {
                          return <FreelancerPricingSection pricing={data.pricing || []} onChange={pricing => setData({ ...data, pricing })} />
                        }
                        if (sectionId === "contact" || sectionId === "socials") {
                          return (
                            <div className="flex flex-col gap-6">
                               <ContactSection t={tContact} contact={data.contact || { email: "", phone: "", whatsapp: "" }} onChange={(patch) => setData({ ...data, contact: { ...(data.contact || {}), ...patch } })} />
                               {sectionId === "contact" && (
                                 <SocialsSection t={tSocials} items={data.socials || []} onChange={(items) => setData({ ...data, socials: items })} />
                              )}
                            </div>
                          );
                        }
                        return <div className="text-sm text-ink-soft p-4 text-center border border-dashed border-black/10 rounded-xl bg-black/5">No editor available for {sectionId}</div>;
                      };

                      return (
                        <div 
                          id={`accordion-${section.id}`} 
                          key={section.id} 
                          className={`flex flex-col rounded-[1rem] bg-white ring-1 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            isExpanded ? "ring-accent/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] my-1" : "ring-black/5 hover:ring-black/10"
                          }`}
                        >
                          {/* Accordion Header */}
                          <div 
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedSection(null);
                              } else {
                                setExpandedSection(section.id);
                                scrollToSection(section.id);
                              }
                            }} 
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                              isExpanded ? "bg-accent/[0.02] border-b border-black/5" : "hover:bg-black/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors duration-300 ${
                                isExpanded ? "bg-accent/10 text-accent" : "bg-black/5 text-ink-soft"
                              }`}>
                                <span className="material-symbols-outlined text-[16px]">{icon}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[13px] font-bold transition-colors ${isExpanded ? "text-accent" : "text-ink"}`}>
                                  {displayLabel}
                                </span>
                                {!isExpanded && section.description && <span className="text-[11px] text-ink-soft line-clamp-1">{section.description}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isExpanded && (
                                <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                                  Editing
                                </span>
                              )}
                              <span className={`material-symbols-outlined text-[18px] text-ink-soft transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                            </div>
                          </div>
                          
                          {/* Accordion Body */}
                          <div 
                            className={`grid transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                              isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="p-5 bg-surface/50">
                                {renderSectionForm(section.id)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Section Button */}
                    <button className="flex items-center justify-center gap-2 mt-2 w-full rounded-[1rem] border-2 border-dashed border-accent/20 py-3 text-[13px] font-bold text-accent transition-all hover:bg-accent/5 hover:border-accent/40">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add section
                    </button>
                  </div>
                </div>
                ) : (
                  <div className="flex flex-col h-full p-1">
                    <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md pb-4 pt-1 mb-4 border-b border-black/5 -mt-2">
                      <span className="text-[10px] font-bold text-ink-soft uppercase tracking-[0.05em]">{tEditor("layout")}</span>
                      <h2 className="text-sm font-bold text-ink mt-0.5">{tEditor("sectionVisibility")}</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                      {definition?.sections.map((section) => {
                        const isHidden = (data.hiddenSections ?? []).includes(section.id);
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => {
                              const current = data.hiddenSections ?? [];
                              setData({
                                ...data,
                                hiddenSections: isHidden
                                  ? current.filter((id) => id !== section.id)
                                  : [...current, section.id],
                              });
                            }}
                            className={`flex items-center justify-between gap-3 rounded-[1rem] px-4 py-3 text-left ring-1 transition-all ${
                              isHidden ? "bg-white/50 ring-black/5 opacity-70" : "bg-white ring-black/5 hover:ring-black/10"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`material-symbols-outlined text-[16px] shrink-0 ${isHidden ? "text-ink-faint" : "text-accent"}`}>visibility</span>
                              <span className={`text-[13px] font-bold truncate ${isHidden ? "text-ink-soft line-through" : "text-ink"}`}>
                                {section.label}
                              </span>
                            </div>
                            <span
                              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                                isHidden ? "bg-black/15" : "bg-accent"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                                  isHidden ? "left-0.5" : "left-4.5"
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-4 text-[11px] text-ink-soft leading-relaxed px-1">
                      Hidden sections are removed from the published page. Your content is kept, so you can re-enable them anytime.
                    </p>
                  </div>
                )}
              </div>
            </>

        </aside>

        {/* Center Canvas: Preview Area */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-[#EEF2FF] items-center" ref={containerRef}>
          {/* Device Toolbar */}
          <div className="flex w-full justify-between items-center px-3 sm:px-8 py-4 shrink-0 bg-white/50 backdrop-blur border-b border-black/5 z-10">
             
             {/* Mobile Drawer Toggles */}
             <div className="flex items-center gap-2 lg:hidden">
               <button
                 type="button"
                 onClick={() => setMobileLeftOpen(true)}
                 className="w-8 h-8 bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center justify-center text-ink-soft hover:text-ink transition-all"
                 aria-label="Open content panel"
               >
                 <span className="material-symbols-outlined text-[17px]">edit_note</span>
               </button>
               <button
                 type="button"
                 onClick={() => setMobileRightOpen(true)}
                 className="w-8 h-8 bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center justify-center text-ink-soft hover:text-ink transition-all"
                 aria-label="Open design panel"
               >
                 <span className="material-symbols-outlined text-[17px]">tune</span>
               </button>
             </div>

             {/* Device Switcher */}
             <div className="flex items-center bg-black/5 rounded-full p-1 shadow-inner">
               {(["desktop", "laptop", "tablet", "mobile"] as const).map(d => (
                 <button
                   key={d}
                   onClick={() => setPreviewDevice(d)}
                   className={`${
                     d === "desktop" || d === "laptop" ? "hidden sm:flex" : ""
                   } px-3 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all ${
                     previewDevice === d 
                       ? "bg-white text-ink shadow-sm ring-1 ring-black/5" 
                       : "text-ink-soft hover:text-ink hover:bg-black/5"
                   }`}
                 >
                   {d}
                 </button>
               ))}
             </div>

             <div className="flex items-center gap-2">
               <div className="bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center overflow-hidden">
                 <select 
                   value={previewZoom} 
                   onChange={(e) => setPreviewZoom(e.target.value as any)}
                   className="text-[11px] font-bold text-ink bg-transparent px-3 py-1.5 outline-none cursor-pointer appearance-none"
                 >
                   <option value="fit-screen">{tEditor("fitScreen")}</option>
                   <option value="50">50%</option>
                   <option value="100">100%</option>
                 </select>
                 <div className="pr-3 pointer-events-none text-ink-soft flex items-center">
                   <span className="material-symbols-outlined text-[14px]">expand_more</span>
                 </div>
               </div>
               <button onClick={() => window.location.reload()} className="w-8 h-8 bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center justify-center text-ink-soft hover:text-ink transition-all">
                 <span className="material-symbols-outlined text-[16px]">refresh</span>
               </button>
             </div>
          </div>
          
          {/* Simulation Workspace */}
          <div 
            id="workspace-canvas"
            className={`flex-1 w-full relative overflow-hidden bg-shell ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onWheel={handleWheel}
            onMouseDown={handleWorkspaceMouseDown}
            onMouseMove={handleWorkspaceMouseMove}
            onMouseUp={handleWorkspaceMouseUp}
            onMouseLeave={handleWorkspaceMouseUp}
          >
            {/* Scale Wrapper */}
            <div 
              className="absolute origin-center transition-transform duration-75 flex flex-col pointer-events-none"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
                width: device.width,
                height: computedHeight,
              }}
            >
              {/* Scrollable Device Frame */}
              <div 
                ref={previewScrollRef}
                onWheel={(e) => e.stopPropagation()}
                className={`flex-1 w-full bg-white relative overflow-y-auto overflow-x-hidden group/preview pointer-events-auto ${
                  ["desktop", "laptop"].includes(previewDevice) 
                    ? "" 
                    : "rounded-[2rem] shadow-2xl ring-1 ring-black/5"
                }`}
                onClick={handlePreviewClick}
              >
                <style>
                  {`
                    .group\\/preview section:hover,
                    .group\\/preview header:hover,
                    .group\\/preview footer:hover,
                    .group\\/preview [data-section-key]:hover {
                      outline: 2px solid #3b82f6 !important;
                      outline-offset: -2px;
                      cursor: pointer;
                      position: relative;
                      z-index: 50;
                      transition: all 0.2s cubic-bezier(0.32,0.72,0,1);
                      transform: scale(1.002);
                    }
                    ${expandedSection ? `
                      .group\\/preview [data-section-key="${expandedSection}"],
                      .group\\/preview #${expandedSection} {
                        outline: 2px solid #3b82f6 !important;
                        outline-offset: -2px;
                        box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.15) !important;
                        position: relative;
                        z-index: 40;
                        transform: scale(1.002);
                        transition: all 0.3s cubic-bezier(0.32,0.72,0,1);
                      }
                    ` : ""}
                  `}
                </style>
                <div
                  className="w-full min-h-full transition-transform duration-300 relative"
                  onMouseMove={handlePreviewMouseMove}
                  onMouseLeave={handlePreviewMouseLeave}
                >
                  <div className={showDesktopPreview ? "pointer-events-auto" : "pointer-events-none"}>
                    <TemplateRenderer
                      templateId={templateId}
                      data={data as any}
                    />
                  </div>
              
              {/* Quick Action Toolbar */}
              {hoveredActionCard && (
                <div 
                  className="absolute z-40 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md p-1.5 shadow-xl transition-all"
                  style={{
                    top: hoveredActionCard.rect.top - 20,
                    left: hoveredActionCard.rect.left + hoveredActionCard.rect.width / 2,
                    transform: "translate(-50%, -100%)",
                  }}
                  onMouseEnter={() => {}} 
                >
                  <button 
                    onClick={() => setExpandedSection(hoveredActionCard.sectionType)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button 
                    onClick={() => {
                      const arrName = hoveredActionCard.sectionType as keyof EditorData;
                      const arr = (data as any)[arrName];
                      const idx = hoveredActionCard.index;
                      if (Array.isArray(arr) && idx > 0) {
                        const newArr = [...arr];
                        const temp = newArr[idx];
                        newArr[idx] = newArr[idx - 1];
                        newArr[idx - 1] = temp;
                        setData({ ...data, [arrName]: newArr });
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </button>
                  <button 
                    onClick={() => {
                      const arrName = hoveredActionCard.sectionType as keyof EditorData;
                      const arr = (data as any)[arrName];
                      const idx = hoveredActionCard.index;
                      if (Array.isArray(arr) && idx < arr.length - 1) {
                        const newArr = [...arr];
                        const temp = newArr[idx];
                        newArr[idx] = newArr[idx + 1];
                        newArr[idx + 1] = temp;
                        setData({ ...data, [arrName]: newArr });
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </button>
                  <button 
                    onClick={() => {
                      const arrName = hoveredActionCard.sectionType as keyof EditorData;
                      const arr = (data as any)[arrName];
                      const idx = hoveredActionCard.index;
                      if (Array.isArray(arr)) {
                        const newArr = arr.filter((_, i) => i !== idx);
                        setData({ ...data, [arrName]: newArr });
                        setHoveredActionCard(null);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-danger/80 hover:text-danger hover:bg-danger/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              )}

                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Design Properties + Publish */}
        <aside className={`fixed inset-y-0 right-0 z-30 flex w-[280px] shrink-0 flex-col border-l border-black/5 bg-surface shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-out lg:static lg:z-auto ${mobileRightOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
          <div className="flex h-[52px] shrink-0 items-end px-5 border-b border-black/5 gap-6">
            <button
              onClick={() => setActiveRightTab("appearance")}
              className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                activeRightTab === "appearance" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveRightTab("settings")}
              className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
                activeRightTab === "settings" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => setMobileRightOpen(false)}
              className="lg:hidden ml-auto mb-2.5 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-black/5 hover:text-ink transition-colors"
              aria-label="Close panel"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            {activeRightTab === "appearance" ? (
            <div className="flex flex-col gap-8 pb-6">

              {/* Appearance Variants Section */}
              <div className="flex flex-col gap-4">
                <span className="text-[12px] font-bold text-ink">{tEditor("appearance")}</span>
                
                <div className="flex flex-col gap-3">
                  {definition?.variants?.map((variant) => {
                    const isActive = data.theme?.variantId === variant.id || (!data.theme?.variantId && variant.id === "default");
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setData((d: any) => ({ ...d, theme: { variantId: variant.id } }))}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isActive 
                            ? "border-accent bg-accent/5 ring-1 ring-accent" 
                            : "border-black/5 bg-white hover:border-black/15 hover:bg-black/[0.02]"
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex-shrink-0 shadow-sm border border-black/10 overflow-hidden flex"
                        >
                          <div className="w-1/2 h-full" style={{ backgroundColor: variant.colors.primary }}></div>
                          <div className="w-1/2 h-full" style={{ backgroundColor: variant.colors.background }}></div>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-bold ${isActive ? "text-accent" : "text-ink"}`}>
                            {variant.label}
                          </span>
                          <span className="text-[11px] text-ink-soft">
                            {isActive ? "Active Variant" : "Click to apply"}
                          </span>
                        </div>
                        {isActive && (
                          <span className="material-symbols-outlined text-[18px] text-accent ml-auto">
                            check_circle
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>


            </div>
            ) : (
              <div className="flex flex-col gap-6 pb-6">
                <div>
                  <span className="text-[12px] font-bold text-ink">{tEditor("seoSettings")}</span>
                  <p className="mt-0.5 text-[11px] text-ink-soft">
                    Sesuaikan bagaimana website kamu tampil di hasil pencarian. Kosongkan untuk memakai nilai otomatis dari profil.
                  </p>
                </div>

                {/* Live search preview */}
                <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-black/5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-ink-faint">
                    Search Preview
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] text-[#0b57d0]">{siteUrl}</span>
                    <span className="line-clamp-2 text-[14px] font-bold leading-snug text-[#1a0dab]">
                      {seo.title?.trim() || `${data.profile?.fullName || subdomain || "Nama"} · Portofolio`}
                    </span>
                    <span className="line-clamp-3 text-[12px] leading-snug text-ink-soft">
                      {seo.description?.trim() || data.profile?.headline || "Portofolio profesional."}
                    </span>
                  </div>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-ink">{tEditor("siteTitle")}</label>
                    <input
                      type="text"
                      value={seo.title ?? ""}
                      onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                      placeholder="Contoh: Nama kamu · UI/UX Designer"
                      maxLength={100}
                      className="w-full rounded-xl bg-canvas px-4 py-2.5 text-[13px] font-medium text-ink outline-none ring-1 ring-black/10 placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                    />
                    <span className="text-[10px] text-ink-faint">{seo.title?.length ?? 0}/100</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-ink">{tEditor("description")}</label>
                    <textarea
                      value={seo.description ?? ""}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                      placeholder="Satu-dua kalimat yang menggambarkan kamu dan layananmu."
                      rows={3}
                      maxLength={300}
                      className="w-full resize-none rounded-xl bg-canvas px-4 py-3 text-[13px] font-medium text-ink outline-none ring-1 ring-black/10 placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                    />
                    <span className="text-[10px] text-ink-faint">{seo.description?.length ?? 0}/300</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-ink">{tEditor("socialImageUrl")}</label>
                    <input
                      type="url"
                      value={seo.ogImage ?? ""}
                      onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                      placeholder="https://… (opsional, fallback ke foto profil)"
                      className="w-full rounded-xl bg-canvas px-4 py-2.5 text-[13px] font-medium text-ink outline-none ring-1 ring-black/10 placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-ink-soft">
                  Perubahan ikut ter-simpan otomatis dan diterapkan ke halaman live setelah Republish.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
      {/* Mobile drawer backdrops */}
      {(mobileLeftOpen || mobileRightOpen) && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => { setMobileLeftOpen(false); setMobileRightOpen(false); }}
          aria-hidden="true"
        />
      )}

      {/* Fullscreen Desktop Preview Modal */}
      {showDesktopPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 shadow-sm">
            <span className="font-display text-lg font-bold text-ink">{tEditor("desktopPreview")}</span>
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
              <TemplateRenderer templateId={templateId} data={data as any} />
            </div>
          </div>
        </div>
      )}

      {/* Version history */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-floating ring-1 ring-black/5">
            <div className="flex items-start justify-between border-b border-black/5 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-ink">{tEditor("versionHistory")}</h3>
                <p className="mt-1 text-sm text-ink-soft">Restore an earlier autosave without changing the live website.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVersionHistory(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
                aria-label="Close version history"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="max-h-[min(28rem,65vh)] overflow-y-auto p-4">
              {versionHistoryLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-ink-soft">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
                  Loading versions...
                </div>
              ) : versionHistory.length === 0 ? (
                <div className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-soft">
                  No saved versions yet. Keep editing and autosave will create a recovery point.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {versionHistory.map((version, index) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-canvas px-4 py-3 ring-1 ring-black/5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`material-symbols-outlined shrink-0 text-[18px] ${index === 0 ? "text-accent" : "text-ink-faint"}`}>
                          {index === 0 ? "schedule" : "history"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            Version {version.versionNumber}{index === 0 ? " · Latest" : ""}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.createdAt))}
                            {version.isAutosave ? " · Autosave" : " · Initial draft"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={restoringVersionId !== null || index === 0}
                        onClick={() => handleRestoreVersion(version.id)}
                        className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-black/10 transition-colors hover:bg-accent hover:text-white hover:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {restoringVersionId === version.id ? "Restoring..." : index === 0 ? "Current" : "Restore"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-black/5 px-6 py-4 text-xs text-ink-soft">
              Restoring creates a new draft version. Your published website stays unchanged until you publish again.
            </div>
          </div>
        </div>
      )}

      {/* Publish Readiness Modal (missing required data) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">{tEditor("publishNotReady")}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                   Complete the following items before publishing your website. Select an item to jump to its editor section.
                </p>
              </div>
              <button type="button" onClick={() => setShowPublishModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {publishErrors.map((issue) => (
                <li key={`${issue.id}-${issue.label}`}>
                  <button
                    type="button"
                    onClick={() => goToReadinessIssue(issue)}
                    className="flex w-full items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-left text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
                  >
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-amber-500">error_outline</span>
                    <span>
                      <span className="block">{issue.label}</span>
                      <span className="mt-0.5 block text-xs font-normal text-amber-700">{issue.detail}</span>
                    </span>
                    <span className="material-symbols-outlined ml-auto mt-0.5 text-[16px]">arrow_forward</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => { setShowPublishModal(false); setActiveLeftTab("content"); }}
              className="mt-5 w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}

      {/* Revert to live confirm dialog (B-4) */}
      {showRevertDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Kembalikan ke yang live?</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Semua perubahan draft yang belum dipublikasikan akan diganti dengan versi yang saat ini live. Aksi ini tidak bisa dibatalkan.
                </p>
              </div>
              <button type="button" onClick={() => setShowRevertDialog(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRevertDialog(false)}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={revertLoading}
                onClick={handleRevertToLive}
                className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-deep disabled:opacity-60"
              >
                {revertLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Mengembalikan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">undo</span>
                    Kembalikan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Dialog (subdomain + gate) */}
      {showPublishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {publishStatus === "published" ? tEditor("websiteLive") : tEditor("publishWebsite")}
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Choose a unique subdomain to publish this portfolio to.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowPublishDialog(false); setPublishError(null); }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Success state when already published */}
            {publishStatus === "published" && (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-positive/10 px-3.5 py-3 text-sm font-semibold text-positive">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {subdomain && (
                  <a href={`${siteUrl}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
                    {`${siteUrl}`}
                  </a>
                )}
              </div>
            )}

            {/* Subdomain input */}
            <label className="mb-1.5 block text-[12px] font-bold text-ink-soft uppercase tracking-[0.05em]">
              Subdomain
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-accent">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(sanitizeSubdomain(e.target.value))}
                placeholder="namamu"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Preview: <span className="font-medium text-ink-soft">{`${domain}/sites/${subdomain || "namamu"}`}</span>
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              Only lowercase letters, numbers, and hyphens (3–63 characters).
            </p>

            {/* Error display */}
            {publishError && publishError !== "subscription_required" && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-600">
                <span className="material-symbols-outlined text-[18px]">error_outline</span>
                {publishError}
              </div>
            )}

            {/* Subscription gate CTA */}
            {publishError === "subscription_required" && (
              <div className="mt-4 rounded-xl bg-accent/[0.06] px-4 py-4 ring-1 ring-accent/20">
                <p className="text-sm font-semibold text-ink">
                  Berlangganan untuk publish website kamu.
                </p>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                  Rp 49.000/bulan — satu paket, tanpa tier. Publish, update, unpublish bebas selama aktif.
                </p>
                <a
                  href={`/${locale}/dashboard/billing`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
                >
                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                  Berlangganan Sekarang
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center gap-3">
              {publishStatus === "published" && subdomain && (
                <button
                  type="button"
                  disabled={publishLoading}
                  onClick={() => handleUnpublish()}
                  className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_off</span>
                  Unpublish
                </button>
              )}
              <button
                type="button"
                disabled={publishLoading || !subdomain.trim()}
                onClick={handlePublish}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-deep hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    {publishStatus === "published" ? "Republish" : "Publish"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
