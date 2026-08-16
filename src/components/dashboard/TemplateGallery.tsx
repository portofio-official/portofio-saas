"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { type TemplateId } from "@/templates/types";
import { PreviewTemplateRenderer as TemplateRenderer, TEMPLATE_CATALOG, TEMPLATE_CATEGORIES } from "@/templates/registry";
import { CreateWorkspaceForm } from "@/components/workspace/CreateWorkspaceForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TemplateCard } from "@/components/dashboard/components/TemplateCard";
import { type BasePortfolioData, BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { StudioData } from "@/templates/definitions/studio/schema";
import type { PortfolioProData } from "@/templates/definitions/portfolio-pro/schema";

type PreviewData = BasePortfolioData & Partial<StudioData> & Partial<PortfolioProData>;

// ─── Template metadata ───────────────────────────────────────────────────────

// Single source of truth lives in src/templates/registry.tsx (derived from each
// template's own meta.gallery). Do NOT redefine template lists here.

const TEMPLATE_META = TEMPLATE_CATALOG;
const CATEGORIES = TEMPLATE_CATEGORIES;

// ─── Dummy preview data ───────────────────────────────────────────────────────

const PREVIEW_DATA: PreviewData = {
  profile: {
    fullName: "Alex Rivera",
    headline: "Product Designer & Creative Director",
    bio: "I craft digital experiences that are both beautiful and functional. 5+ years working with startups and global brands.",
    location: "Jakarta, Indonesia",
  },
  experiences: [
    { company: "Figma", role: "Senior Product Designer", startDate: "2022-01", description: "Led design system overhaul" },
    { company: "Tokopedia", role: "UI/UX Designer", startDate: "2019-06", endDate: "2021-12" },
  ],
  educations: [
    { institution: "Institut Teknologi Bandung", degree: "Bachelor", field: "Visual Communication Design", startYear: 2015, endYear: 2019 },
  ],
  skills: ["Figma", "React", "Framer", "Tailwind", "Prototyping", "Motion Design"],
  projects: [
    { title: "Brand Refresh: GoTo", description: "Complete visual identity overhaul for Indonesia's largest tech company.", link: "#" },
    { title: "Design System: Shopee", description: "Built a scalable component library used by 200+ designers.", link: "#" },
  ],
  contact: { email: "alex@example.com", phone: "+62 812 3456 7890" },
  socials: [
    { platform: "linkedin", url: "https://linkedin.com/in/alexrivera" },
    { platform: "github", url: "https://github.com/alexrivera" },
  ],
  theme: { ...BASE_PROFILE_DEFAULTS.theme },
  hiddenSections: [],
  hero: {
    headline: "We build digital experiences.",
    subheadline: "An independent studio crafting premium interfaces for the web and mobile.",
    ctaLabel: "View Selected Work",
    badges: [],
  },
  about: {
    paragraphs: [
      "I craft digital experiences that are both beautiful and functional.",
      "5+ years working with startups and global brands across product design and design systems.",
    ],
    tags: ["Product Design", "Design Systems", "Prototyping"],
    yearsExperience: 5,
  },
  expertise: [
    { title: "Digital Product Design", description: "Crafting intuitive and engaging user interfaces." },
    { title: "Brand Identity", description: "Building cohesive and memorable brand systems." },
    { title: "Design Engineering", description: "Bridging the gap between design and code." }
  ],
  testimonials: [
    { name: "Sarah Jenkins", role: "CEO at TechFlow", quote: "The team delivered exceptional results that completely transformed our digital presence." }
  ],
  skillsShowcase: [
    { name: "Figma" },
    { name: "React" },
    { name: "Framer" },
    { name: "Tailwind" },
  ],
  experienceDetails: [
    {
      company: "Figma",
      role: "Senior Product Designer",
      period: "2022 - Sekarang",
      achievements: ["Led a design system overhaul used across 5 product teams."],
      tools: ["Figma", "React", "Storybook"],
    },
  ],
  educationDetails: [
    {
      institution: "Institut Teknologi Bandung",
      degree: "Bachelor, Visual Communication Design",
      period: "2015 - 2019",
      achievements: ["Graduated with honors."],
    },
  ],
  caseStudies: [
    {
      title: "Brand Refresh: GoTo",
      category: "Brand Identity",
      date: "Mar 2024",
      images: [],
      description: "Complete visual identity overhaul for Indonesia's largest tech company.",
      achievements: ["Unified 6 sub-brands under one visual system."],
      tech: ["Figma", "Illustrator"],
      confidential: false,
      link: "#",
    },
  ],
  certificates: [
    { title: "Advanced UX Research", issuer: "Nielsen Norman Group" },
  ],
  gallery: [
    {
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23334155'/%3E%3C/svg%3E",
      title: "Design Systems Workshop",
      location: "Jakarta",
      date: "Jun 2025",
      description: "Led a workshop on scalable design systems for 40+ product designers.",
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TemplateGallery({ 
  isLoggedIn = false, 
  embedded = false,
  landingMode = false,
  activeTemplateIds,
  inUseTemplateIds,
}: { 
  isLoggedIn?: boolean; 
  embedded?: boolean;
  landingMode?: boolean;
  activeTemplateIds?: string[];
  inUseTemplateIds?: string[];
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [creatingForId, setCreatingForId] = useState<TemplateId | null>(null);
  const router = useRouter();
  const t = useTranslations("TemplateGallery");

  // ponytail: handle ESC key press & disable body scroll when preview modal is open
  useEffect(() => {
    if (!previewId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewId(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewId]);

  const handleUseTemplate = (id: TemplateId) => {
    if (isLoggedIn) {
      setCreatingForId(id);
    } else {
      router.push(`/signup?templateId=${id}`);
    }
  };

  const filtered = TEMPLATE_META.filter((t) => {
    const matchesCategory = t.tags.includes(activeCategory);
    const matchesActiveList = !activeTemplateIds || activeTemplateIds.includes(t.id);
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesActiveList && matchesSearch;
  });

  const galleryContent = (
    <>
      {/* Top hero bar - Hide in landing mode */}
      {!landingMode && (
        <>
          <PageHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <div className="relative w-full min-w-[240px] md:w-[280px]">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-ink-faint">
                  search
                </span>
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-black/[0.03] pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-faint ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            }
          />

          {/* Category filter — horizontal segmented rail */}
          <div className="flex flex-wrap items-center gap-2 px-6 py-5 sm:px-8">
            <SegmentedControl
              ariaLabel={t("eyebrow")}
              options={CATEGORIES.map((cat) => ({ value: cat as string, label: cat }))}
              value={activeCategory}
              onChange={(v) => setActiveCategory(v as string)}
            />
          </div>
        </>
      )}

      {/* Cards grid */}
      <div className={`flex-1 ${landingMode ? "pt-0" : "overflow-y-auto px-6 pb-24 pt-8 sm:px-8"}`}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-ink-faint">search_off</span>
            <p className="mt-2 font-display text-base font-bold text-ink">{t("searchEmptyTitle")}</p>
            <p className="mt-1 text-xs text-ink-soft">{t("searchEmptyDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pb-6">
            {filtered.map((meta, index) => (
              <TemplateCard
                key={meta.id}
                meta={meta}
                index={index}
                previewData={PREVIEW_DATA}
                isInUse={inUseTemplateIds?.includes(meta.id)}
                onPreview={(id) => setPreviewId(id)}
                onUse={(id) => handleUseTemplate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className={embedded ? (landingMode ? "flex w-full flex-col font-sans" : "flex h-full w-full flex-col overflow-hidden font-sans") : "flex h-full w-full gap-6 overflow-hidden bg-canvas p-6 font-sans"}>
        {embedded ? (
          galleryContent
        ) : (
          <main className="flex flex-1 flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
            {galleryContent}
          </main>
        )}
      </div>

      {/* ── Full-screen preview modal with Viewport Switcher ── */}
      {previewId && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md transition-all animate-fadeIn"
          onClick={() => setPreviewId(null)}
        >
          {/* Header Bar */}
          <div
            className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-surface px-6 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => setPreviewId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
              <div>
                <span className="font-display text-base font-bold text-ink">
                  {TEMPLATE_META.find((m) => m.id === previewId)?.name}
                </span>
                <span className="ml-2.5 rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-ink-soft">
                  {t("livePreview")}
                </span>
              </div>
            </div>

            {/* Viewport Device Switcher */}
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-canvas p-1 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setViewportMode("desktop")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "desktop" ? "bg-surface text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                {t("desktop")}
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("tablet")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "tablet" ? "bg-surface text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tablet_mac</span>
                {t("tablet")}
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "mobile" ? "bg-surface text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">smartphone</span>
                {t("mobile")}
              </button>
            </div>

            {/* CTA Button */}
              <button
                type="button"
                onClick={() => { handleUseTemplate(previewId); setPreviewId(null); }}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-accent-deep active:scale-95"
              >
                {t("useThisTemplate")}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
          </div>

          {/* Modal Main Viewport / Scroll Canvas */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setPreviewId(null);
              }
            }}
          >
            {viewportMode === "desktop" ? (
              /* Desktop View: Full width scrollable document */
              <div
                className="w-full max-w-[1240px] rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden my-2"
                onClick={(e) => e.stopPropagation()}
              >
                <TemplateRenderer templateId={previewId} data={PREVIEW_DATA} />
              </div>
            ) : viewportMode === "tablet" ? (
              /* Tablet Device Frame with internal screen scrolling */
              <div
                className="my-auto flex h-[820px] max-h-[84vh] w-[768px] flex-col overflow-hidden rounded-[2.5rem] border-[12px] border-gray-900 bg-white shadow-2xl ring-1 ring-black/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-5 shrink-0 items-center justify-center bg-gray-900">
                  <div className="h-1.5 w-12 rounded-full bg-gray-700" />
                </div>
                <div className="flex-1 overflow-y-auto">
                  <TemplateRenderer templateId={previewId} data={PREVIEW_DATA} />
                </div>
              </div>
            ) : (
              /* Mobile Smartphone Frame with internal screen scrolling */
              <div
                className="my-auto flex h-[740px] max-h-[84vh] w-[375px] flex-col overflow-hidden rounded-[3rem] border-[14px] border-gray-900 bg-white shadow-2xl ring-1 ring-black/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-7 shrink-0 items-center justify-center bg-gray-900">
                  <div className="h-3.5 w-24 rounded-full bg-black" />
                </div>
                <div className="flex-1 overflow-y-auto">
                  <TemplateRenderer templateId={previewId} data={PREVIEW_DATA} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── New Project modal overlay ── */}
      {creatingForId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreatingForId(null);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">{t("createProjectTitle")}</h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {t("createProjectDesc", { name: TEMPLATE_META.find(tpl => tpl.id === creatingForId)?.name ?? "" })}
                </p>
              </div>
              <button type="button"
                onClick={() => setCreatingForId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <CreateWorkspaceForm templateId={creatingForId} />
          </div>
        </div>
      )}
    </>
  );
}
