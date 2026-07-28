"use client";

import { useState, useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { type TemplateId } from "@/templates/types";
import { PreviewTemplateRenderer as TemplateRenderer } from "@/templates/registry";
import { CreateWorkspaceForm } from "@/components/workspace/CreateWorkspaceForm";
import type { BasePortfolioData } from "@/templates/shared/_base";
import type { StudioData } from "@/templates/definitions/studio/schema";
import type { PortfolioProData } from "@/templates/definitions/portfolio-pro/schema";

type PreviewData = BasePortfolioData & Partial<StudioData> & Partial<PortfolioProData>;

// ─── Template metadata ───────────────────────────────────────────────────────

interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  tags: string[];
  accentBg: string; // CSS class for the thumbnail background color
}

const TEMPLATE_META: TemplateMeta[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, serif-forward, single column. Great for writers & consultants.",
    tags: ["All", "Personal"],
    accentBg: "bg-[#f9f6f1]",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong accent colors, large headings. Perfect for creatives & marketers.",
    tags: ["All", "Creative"],
    accentBg: "bg-[#1a1a2e]",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Project grid front-and-center. Ideal for designers & photographers.",
    tags: ["All", "Creative", "Portfolio"],
    accentBg: "bg-[#0f172a]",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Formal timeline layout. Built for job seekers & professionals.",
    tags: ["All", "Professional"],
    accentBg: "bg-[#f0f4ff]",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark theme, neon accent. Made for developers & tech profiles.",
    tags: ["All", "Developer"],
    accentBg: "bg-[#09090b]",
  },
  {
    id: "studio",
    name: "Vanguard Studio",
    description: "Agency-tier design with asymmetrical bento grids, ethereal glass textures, and fluid motion.",
    tags: ["All", "Creative", "Portfolio"],
    accentBg: "bg-[#050505]",
  },
  {
    id: "portfolio-pro",
    name: "Portfolio Pro",
    description: "Complete professional portfolio with case studies, certificates, and a gallery. Visitors can switch accent color and dark/light mode.",
    tags: ["All", "Professional", "Portfolio"],
    accentBg: "bg-[#0a0a0f]",
  },
];

const CATEGORIES = ["All", "Personal", "Creative", "Portfolio", "Professional", "Developer"];

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
    { title: "Brand Refresh — GoTo", description: "Complete visual identity overhaul for Indonesia's largest tech company.", link: "#" },
    { title: "Design System — Shopee", description: "Built a scalable component library used by 200+ designers.", link: "#" },
  ],
  contact: { email: "alex@example.com", phone: "+62 812 3456 7890" },
  socials: [
    { platform: "linkedin", url: "https://linkedin.com/in/alexrivera" },
    { platform: "github", url: "https://github.com/alexrivera" },
  ],
  theme: { accentColor: "#00cf7c", font: "sans" },
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
      title: "Brand Refresh — GoTo",
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
}: { 
  isLoggedIn?: boolean; 
  embedded?: boolean;
  landingMode?: boolean;
  activeTemplateIds?: string[];
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<TemplateId | null>(null);
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [creatingForId, setCreatingForId] = useState<TemplateId | null>(null);
  const router = useRouter();

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
        <header className="gsap-header shrink-0 px-12 pt-12">
          <p className="mb-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint w-max bg-black/[0.03]">
            Pilih Desain Terbaik Anda
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
                Galeri Template
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                Pilih template profesional yang siap disesuaikan dengan portofolio Anda.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] md:min-w-[280px]">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-ink-faint">
                search
              </span>
              <input
                type="text"
                placeholder="Cari template..."
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
          </div>

          {/* Category filter — horizontal, not a sidebar */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 ease-[var(--ease-fluid)] ${
                  activeCategory === cat
                    ? "bg-ink text-white shadow-sm"
                    : "bg-black/[0.03] text-ink-soft hover:bg-black/[0.06] hover:text-ink active:scale-[0.98]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>
      )}

      {/* Cards grid */}
      <div className={`flex-1 px-12 pb-24 ${landingMode ? "pt-0" : "overflow-y-auto pt-8"}`}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-ink-faint">search_off</span>
            <p className="mt-2 font-display text-base font-bold text-ink">Tidak ada template ditemukan</p>
            <p className="mt-1 text-xs text-ink-soft">Coba kata kunci pencarian lain atau pilih filter kategori.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((meta) => {
              const isPopular = meta.id === "studio" || meta.id === "portfolio-pro";

              return (
                <div
                  key={meta.id}
                  className="gsap-template-card group relative flex flex-col overflow-hidden rounded-[2rem] bg-shell p-2 shadow-[var(--shadow-diffused)] ring-1 ring-black/5 transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-1 hover:shadow-xl hover:ring-black/10"
                  onMouseEnter={() => setHoveredId(meta.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Outer Frame with macOS dot bar */}
                  <div
                    className={`relative flex flex-col h-64 w-full cursor-pointer overflow-hidden rounded-[1.5rem] shadow-[var(--shadow-inner-bezel)] ${meta.accentBg}`}
                    onClick={() => setPreviewId(meta.id)}
                  >
                    {/* macOS dots bar */}
                    <div className="z-10 flex items-center justify-between border-b border-black/10 bg-white/70 px-3 py-1.5 backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                      </div>
                      <span className="font-mono text-[10px] font-medium text-gray-400 select-none tracking-tight">
                        {meta.id}.portofio.app
                      </span>
                    </div>

                    {/* Scaled-down live template preview */}
                    <div className="relative flex-1 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                      <div
                        className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-700 ease-[var(--ease-fluid)] group-hover:scale-[1.03]"
                        style={{ transform: "scale(0.35)", width: "285%", height: "285%" }}
                      >
                        <TemplateRenderer templateId={meta.id} data={PREVIEW_DATA} />
                      </div>

                      {/* Hover overlay */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-[var(--ease-fluid)] ${
                          hoveredId === meta.id ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); setPreviewId(meta.id); }}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 ease-[var(--ease-fluid)] hover:scale-110 hover:bg-white/30"
                          title="Preview Live"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); handleUseTemplate(meta.id); }}
                          className="flex items-center gap-2 rounded-full bg-accent py-2 pl-5 pr-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 ease-[var(--ease-fluid)] hover:bg-accent-deep active:scale-[0.98]"
                        >
                          Gunakan Template
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 ease-[var(--ease-fluid)] group-hover:translate-x-0.5">
                            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="flex flex-col px-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base font-bold text-ink">{meta.name}</p>
                      {isPopular && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent-deep ring-1 ring-accent/20">
                          ★ Populer
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] font-medium text-ink-soft leading-relaxed">{meta.description}</p>
                    
                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {meta.tags.filter(t => t !== "All").map((tag) => (
                        <span key={tag} className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
                  Live Preview
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
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("tablet")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "tablet" ? "bg-surface text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tablet_mac</span>
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "mobile" ? "bg-surface text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">smartphone</span>
                Mobile
              </button>
            </div>

            {/* CTA Button */}
            <button type="button"
              onClick={() => { handleUseTemplate(previewId); setPreviewId(null); }}
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-accent-deep active:scale-95"
            >
              Gunakan Template Ini
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
                <h2 className="font-display text-lg font-bold text-ink">Beri Nama Project Anda</h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Menggunakan template <span className="font-semibold text-ink">{TEMPLATE_META.find(t => t.id === creatingForId)?.name}</span>
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
