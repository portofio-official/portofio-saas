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
} from "@/lib/projects";
import type { TemplateId } from "@/templates/types";
import type { StudioData } from "@/templates/definitions/studio/schema";
import type { PortfolioProData } from "@/templates/definitions/portfolio-pro/schema";
import { WebsiteDocument } from "@/templates/definition";
import { getDefinition } from "@/templates/registry";
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

// Editor sub-panels
import { EditorLeftPanel } from "./editor/EditorLeftPanel";
import { EditorCenterCanvas, type HoveredActionCard } from "./editor/EditorCenterCanvas";
import { EditorRightPanel } from "./editor/EditorRightPanel";
import { EditorDialogs } from "./editor/EditorDialogs";
import { SwitchTemplateModal } from "./editor/SwitchTemplateModal";
import { DEVICE_CONFIG, type EditorData, type PreviewDevice, type PreviewZoom } from "./editor/types";
import type { EditorProps, ReadinessIssue, VersionListItem } from "./editor/types";

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
}: EditorProps) {
  const [data, setData, history] = useHistory<EditorData>(
    (initialDocument.data ?? {}) as EditorData,
  );
  const templateId = initialTemplateId as TemplateId;
  const [showDesktopPreview, setShowDesktopPreview] = useState(false);

  // Tab States
  const [activeLeftTab, setActiveLeftTab] = useState<"content" | "sections">("content");
  const [activeRightTab, setActiveRightTab] = useState<"appearance" | "settings">("appearance");

  // Accordion State
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Publish Readiness State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishErrors, setPublishErrors] = useState<ReadinessIssue[]>([]);

  // Publish dialog state
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Quick Action Toolbar State
  const [hoveredActionCard, setHoveredActionCard] = useState<HoveredActionCard | null>(null);

  // Viewport Simulation State
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewZoom, setPreviewZoom] = useState<PreviewZoom>("fit-screen");

  // Mobile drawer state (sidebars become drawers below lg breakpoint)
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // SEO settings (persisted in WebsiteDocument.meta.seo)
  const [seo, setSeo] = useState<{ title?: string; description?: string; ogImage?: string }>(
    initialDocument.meta?.seo ?? {},
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
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
  // Scale the frame padding down on narrow canvases (mobile) so the device
  // preview isn't squashed to ~63% on a phone.
  const padding = isDesktopOrLaptop ? 0 : Math.min(64, Math.max(12, containerSize.width * 0.1));
  const availableW = Math.max(containerSize.width - padding * 2, 100);
  const scaleFitWidth = availableW / device.width;

  let scale = 1;
  if (previewZoom === "fit-screen") scale = scaleFitWidth;
  else scale = parseInt(previewZoom) / 100;

  // Dynamic height for Desktop/Laptop so it spans the full vertical workspace
  const computedHeight = isDesktopOrLaptop ? containerSize.height / scale : device.height;

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
  const [showSwitchTemplate, setShowSwitchTemplate] = useState(false);

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
          behavior: "smooth",
        });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Canvas Panning Handlers
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default scrolling on the workspace if it's scrollable, but we handle it via state
    setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
  };

  const handleWorkspaceMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "workspace-canvas") {
      setIsPanning(true);
    }
  };

  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  const handleWorkspaceMouseUp = () => {
    setIsPanning(false);
  };

  const touchPanRef = useRef<{ id: number; lastX: number; lastY: number } | null>(null);

  // Touch panning for the workspace. Vertical drags over the device frame scroll
  // the preview instead of panning (below-fold content stays reachable); horizontal
  // drags always pan the workspace because the frame never scrolls horizontally.
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchPanRef.current = { id: touch.identifier, lastX: touch.clientX, lastY: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = touchPanRef.current;
    if (!t) return;
    const touch = Array.from(e.touches).find((x) => x.identifier === t.id);
    if (!touch) return;
    const dx = touch.clientX - t.lastX;
    const dy = touch.clientY - t.lastY;
    t.lastX = touch.clientX;
    t.lastY = touch.clientY;
    if (dx === 0 && dy === 0) return;

    const overFrame = previewScrollRef.current?.contains(e.target as Node);
    if (overFrame && previewScrollRef.current) {
      previewScrollRef.current.scrollTop -= dy / scale;
      setPan((p) => ({ x: p.x + dx, y: p.y }));
    } else {
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  };

  const handleTouchEnd = () => {
    touchPanRef.current = null;
  };

  const setHoveredFromItem = (itemEl: HTMLElement) => {
    if (!previewScrollRef.current) return;
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
      } as DOMRect,
    });
  };

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    const itemEl = (e.target as HTMLElement).closest("[data-section-type][data-item-index]") as HTMLElement;
    if (itemEl) setHoveredFromItem(itemEl);
  };

  const handlePreviewMouseLeave = () => {
    setHoveredActionCard(null);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest("a") || target.closest("button")) {
      return;
    }

    // Touch equivalent of hover: tapping a section item reveals its quick-action toolbar.
    const itemEl = target.closest("[data-section-type][data-item-index]") as HTMLElement;
    if (itemEl) {
      setHoveredFromItem(itemEl);
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
          (s) => s.id === sectionId || s.id === sectionElement.id || s.id === sectionElement.getAttribute("data-section-key"),
        );

        if (validSection) {
          setExpandedSection(validSection.id);
          // On mobile the left panel is an off-screen drawer; open it so the
          // tapped section's accordion is actually reachable.
          setMobileLeftOpen(true);
          // Scroll left panel to the expanded accordion after a short delay
          setTimeout(() => {
            const accordionEl = document.getElementById(`accordion-${validSection.id}`);
            if (accordionEl) {
              accordionEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100);
        }
      }
    } else {
      // Tapping empty preview area dismisses the quick-action toolbar.
      setHoveredActionCard(null);
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
    data: data as unknown as Record<string, unknown>,
  });

  const [customSaveStatus, setCustomSaveStatus] = useState<"Saving..." | "Saved just now" | "✓ All changes saved" | "Error saving" | "">("");

  useAutosave({ data, seo }, async () => {
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
        if (e.key === "Escape") {
          e.target.blur();
        }
        return;
      }

      if (e.key === "Escape") {
        setExpandedSection(null);
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          history.redo();
        } else {
          history.undo();
        }
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
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
  const tEditor = useTranslations("Editor");
  const tProfile = useTranslations("PortfolioForm.profile");
  const tExperience = useTranslations("PortfolioForm.experience");
  const tEducation = useTranslations("PortfolioForm.education");
  const tSkills = useTranslations("PortfolioForm.skills");
  const tProjects = useTranslations("PortfolioForm.projects");
  const tContact = useTranslations("PortfolioForm.contact");
  const tSocials = useTranslations("PortfolioForm.socials");

  const locale = useLocale();

  const definition = getDefinition(templateId);

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

  // Section form resolver: maps a section id to the template-specific editor form.
  const renderSectionForm = (sectionId: string) => {
    if (sectionId === "profile" || sectionId === "about") {
      if (templateId === "portfolio-pro" && sectionId === "about") {
        return <PortfolioProAboutSection about={data.about!} onChange={(patch) => setData({ ...data, about: { ...data.about!, ...patch } })} />;
      }
      return <ProfileSection t={tProfile} description="Tell visitors who you are and what you do." profile={data.profile || { fullName: "", headline: "", bio: "", photoUrl: "", location: "" }} onChange={(patch) => setData({ ...data, profile: { ...(data.profile || {}), ...patch } })} />;
    }
    if (sectionId === "hero") {
      if (templateId === "studio") {
        return <StudioHeroSection hero={data.hero as StudioData["hero"]} onChange={(patch) => setData({ ...data, hero: { ...(data.hero as StudioData["hero"]), ...patch } })} />;
      }
      if (templateId === "portfolio-pro") {
        return <PortfolioProHeroSection hero={data.hero as PortfolioProData["hero"]} onChange={(patch) => setData({ ...data, hero: { ...(data.hero as PortfolioProData["hero"]), ...patch } })} />;
      }
      // Fallback to profile section if hero isn't explicitly defined
      return <ProfileSection t={tProfile} description="Introduce yourself and set the tone of your portfolio." profile={data.profile || { fullName: "", headline: "", bio: "", photoUrl: "", location: "" }} onChange={(patch) => setData({ ...data, profile: { ...(data.profile || {}), ...patch } })} />;
    }
    if (sectionId === "expertise") {
      return <StudioExpertiseSection expertise={data.expertise || []} onChange={(items) => setData({ ...data, expertise: items })} />;
    }
    if (sectionId === "projects" || sectionId === "work") {
      return (
        <div className="flex flex-col gap-3">
          {workspaceId && (
            <a href={`/${locale}/dashboard/content`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-[1rem] border border-accent/25 bg-accent/[0.04] px-4 py-2.5 text-[12px] font-bold text-accent transition-all hover:bg-accent/[0.08]">
              <span className="material-symbols-outlined text-[14px]">database</span>
              Kelola project di Content Library
            </a>
          )}
          <div className="pointer-events-none opacity-75"><ProjectsSection t={tProjects} items={data.projects || []} onChange={() => undefined} /></div>
        </div>
      );
    }
    if (sectionId === "caseStudies") {
      return <PortfolioProCaseStudiesSection items={data.caseStudies || []} onChange={(items) => setData({ ...data, caseStudies: items })} />;
    }
    if (sectionId === "skills") {
      return (
        <SkillsSection
          eyebrow={tSkills("eyebrow")}
          title={tSkills("title")}
          description="Help recruiters understand your technical expertise."
          placeholder={tSkills("placeholder")}
          removeLabel={tSkills("removeLabel")}
          skills={data.skills || []}
          onChange={(items) => setData({ ...data, skills: items })}
        />
      );
    }
    if (sectionId === "skillsShowcase") {
      return <PortfolioProSkillsSection items={data.skillsShowcase || []} onChange={(items) => setData({ ...data, skillsShowcase: items })} />;
    }
    if (sectionId === "experience") {
      return <ExperienceSection t={tExperience} items={data.experiences || []} onChange={(items) => setData({ ...data, experiences: items })} />;
    }
    if (sectionId === "experienceDetails") {
      return <PortfolioProExperienceSection items={data.experienceDetails || []} onChange={(items) => setData({ ...data, experienceDetails: items })} />;
    }
    if (sectionId === "education") {
      return <EducationSection t={tEducation} items={data.educations || []} onChange={(items) => setData({ ...data, educations: items })} />;
    }
    if (sectionId === "educationDetails") {
      return <PortfolioProEducationSection items={data.educationDetails || []} onChange={(items) => setData({ ...data, educationDetails: items })} />;
    }
    if (sectionId === "certificates") {
      return <PortfolioProCertificatesSection items={data.certificates || []} onChange={(items) => setData({ ...data, certificates: items })} />;
    }
    if (sectionId === "gallery") {
      return <PortfolioProGallerySection items={data.gallery || []} onChange={(items) => setData({ ...data, gallery: items })} />;
    }
    if (sectionId === "testimonials") {
      if (templateId === "studio") {
        return <StudioTestimonialsSection testimonials={data.testimonials || []} onChange={(testimonials) => setData({ ...data, testimonials })} />;
      }
      return <FreelancerTestimonialsSection testimonials={(data.testimonials || []) as never} onChange={(testimonials) => setData({ ...data, testimonials: testimonials as never })} />;
    }
    if (sectionId === "pricing") {
      return <FreelancerPricingSection pricing={data.pricing || []} onChange={(pricing) => setData({ ...data, pricing })} />;
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
    <div className="flex h-full w-full overflow-hidden bg-surface text-ink font-sans">
      {/* Main Right Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="gsap-header relative z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-black/5 bg-surface px-2 sm:px-6 shadow-sm">
          <a
            href={`/${locale}/dashboard`}
            className="flex min-w-0 items-center gap-2 text-ink-soft hover:text-ink transition-colors cursor-pointer"
            aria-label={tEditor("backToDashboard")}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="text-[13px] font-medium hidden sm:inline">{tEditor("backToDashboard")}</span>
          </a>

          <div className="flex items-center justify-center sm:flex-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-positive">check</span>
              <span className="text-[12px] font-medium text-positive">{customSaveStatus}</span>
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-3">
            {/* Explicit draft/live state so users know what is currently public. */}
            {publishStatus === "published" && subdomain ? (
              <a
                href={`http://${siteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 rounded-full bg-positive/10 px-3 py-1 text-[11px] font-bold text-positive hover:bg-positive/20 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                Live
              </a>
            ) : (
              <span className="hidden lg:flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1 text-[11px] font-bold text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
                Draft only
              </span>
            )}
            <button
              type="button"
              onClick={handleOpenVersionHistory}
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-3 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5 active:bg-black/10"
              aria-label={tEditor("versionHistory")}
            >
              <span className="material-symbols-outlined text-[14px]">history</span>
              <span className="hidden xl:inline">{tEditor("versions")}</span>
            </button>
            <button
              onClick={() => setShowDesktopPreview(true)}
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-3 sm:px-4 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5 active:bg-black/10"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              <span className="hidden sm:inline">{tEditor("preview")}</span>
            </button>
            <button
              onClick={() => saveDraftAction(projectId, documentForSave())}
              className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 px-3 sm:px-4 py-1.5 text-[12px] font-medium text-ink shadow-sm transition-all hover:bg-black/5 active:bg-black/10"
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
              className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 sm:px-5 py-1.5 text-[12px] font-medium text-white shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
              <span className="hidden sm:inline">Publish</span>
            </button>
          </div>
        </header>

        {/* Profile Sync Banner (A-3: FLOW 4 step K–N) */}
        {showProfileBanner && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-warning/20 bg-warning-soft px-4 sm:px-6 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-warning">sync</span>
              <span className="text-[13px] font-medium text-ink-soft">
                {tEditor("profileSyncMsg")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowProfileBanner(false)}
                className="rounded-full px-3 py-1 text-[12px] font-medium text-ink-soft transition-colors hover:bg-warning/10"
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
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-info/20 bg-info-soft px-4 sm:px-6 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-info">published_with_changes</span>
              <span className="text-[13px] font-medium text-ink-soft">
                {tEditor("divergenceMsg")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowRevertDialog(true)}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1 text-[12px] font-semibold text-info ring-1 ring-info/20 transition-colors hover:bg-info-soft"
              >
                <span className="material-symbols-outlined text-[14px]">undo</span>
                {tEditor("revertToLive")}
              </button>
            </div>
          </div>
        )}

        {/* 3-Column Workspace */}
        <div className="flex flex-1 overflow-hidden">
          <EditorLeftPanel
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            sections={definition?.sections ?? []}
            data={data}
            setData={setData}
            scrollToSection={scrollToSection}
            renderSectionForm={renderSectionForm}
            mobileLeftOpen={mobileLeftOpen}
            setMobileLeftOpen={setMobileLeftOpen}
            definitionLabel={(id) =>
              definition?.sections.find((s) => s.id === id)?.label ?? id
            }
          />

          <EditorCenterCanvas
            templateId={templateId}
            data={data}
            setData={setData}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            previewDevice={previewDevice}
            setPreviewDevice={setPreviewDevice}
            previewZoom={previewZoom}
            setPreviewZoom={setPreviewZoom}
            pan={pan}
            isPanning={isPanning}
            scale={scale}
            computedHeight={computedHeight}
            setMobileLeftOpen={setMobileLeftOpen}
            setMobileRightOpen={setMobileRightOpen}
            hoveredActionCard={hoveredActionCard}
            setHoveredActionCard={setHoveredActionCard}
            previewScrollRef={previewScrollRef}
            containerRef={containerRef}
            onWheel={handleWheel}
            onWorkspaceMouseDown={handleWorkspaceMouseDown}
            onWorkspaceMouseMove={handleWorkspaceMouseMove}
            onWorkspaceMouseUp={handleWorkspaceMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onPreviewMouseMove={handlePreviewMouseMove}
            onPreviewMouseLeave={handlePreviewMouseLeave}
            onPreviewClick={handlePreviewClick}
          />

          <EditorRightPanel
            activeRightTab={activeRightTab}
            setActiveRightTab={setActiveRightTab}
            variants={(definition?.variants ?? []).map((v) => ({
              id: v.id,
              label: v.label,
              colors: { primary: v.colors.primary, background: v.colors.background },
            }))}
            data={data}
            setData={setData}
            seo={seo}
            setSeo={setSeo}
            siteUrl={siteUrl}
            subdomain={subdomain}
            mobileRightOpen={mobileRightOpen}
            setMobileRightOpen={setMobileRightOpen}
            onOpenSwitchTemplate={() => setShowSwitchTemplate(true)}
          />
        </div>
      </div>

      {showSwitchTemplate && (
        <SwitchTemplateModal
          projectId={projectId}
          currentTemplateId={templateId}
          currentDocument={documentForSave()}
          onClose={() => setShowSwitchTemplate(false)}
        />
      )}

      {/* Mobile drawer backdrops */}
      {(mobileLeftOpen || mobileRightOpen) && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => { setMobileLeftOpen(false); setMobileRightOpen(false); }}
          aria-hidden="true"
        />
      )}

      <EditorDialogs
        locale={locale}
        domain={domain}
        templateId={templateId}
        data={data}
        showDesktopPreview={showDesktopPreview}
        onCloseDesktopPreview={() => setShowDesktopPreview(false)}
        showVersionHistory={showVersionHistory}
        versionHistory={versionHistory}
        versionHistoryLoading={versionHistoryLoading}
        restoringVersionId={restoringVersionId}
        onCloseVersionHistory={() => setShowVersionHistory(false)}
        onRestoreVersion={handleRestoreVersion}
        showPublishModal={showPublishModal}
        publishErrors={publishErrors}
        onClosePublishModal={() => setShowPublishModal(false)}
        onGoToIssue={goToReadinessIssue}
        showRevertDialog={showRevertDialog}
        revertLoading={revertLoading}
        onCloseRevertDialog={() => setShowRevertDialog(false)}
        onRevert={handleRevertToLive}
        showPublishDialog={showPublishDialog}
        publishStatus={publishStatus}
        subdomain={subdomain}
        siteUrl={siteUrl}
        publishError={publishError}
        publishLoading={publishLoading}
        onSubdomainChange={(value) => setSubdomain(sanitizeSubdomain(value))}
        onClosePublishDialog={() => { setShowPublishDialog(false); setPublishError(null); }}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    </div>
  );
}
