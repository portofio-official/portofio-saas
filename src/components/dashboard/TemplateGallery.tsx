"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { useRouter } from "@/i18n/navigation";
import { type TemplateId } from "@/lib/templates/types";
import { LegacyTemplateRenderer as TemplateRenderer } from "@/components/templates/registry";
import { CreateWorkspaceForm } from "@/components/workspace/CreateWorkspaceForm";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

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
];

const CATEGORIES = ["All", "Personal", "Creative", "Portfolio", "Professional", "Developer"];

// ─── Dummy preview data ───────────────────────────────────────────────────────

const PREVIEW_DATA: PortfolioData = {
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
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TemplateGallery({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<TemplateId | null>(null);
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);
  const [creatingForId, setCreatingForId] = useState<TemplateId | null>(null);
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-template-card",
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "var(--ease-fluid)", stagger: 0.08, delay: 0.1 }
      );
      gsap.fromTo(
        ".gsap-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "var(--ease-fluid)" }
      );
    },
    { scope: container }
  );

  const handleUseTemplate = (id: TemplateId) => {
    if (isLoggedIn) {
      setCreatingForId(id);
    } else {
      router.push(`/signup?templateId=${id}`);
    }
  };

  const filtered = TEMPLATE_META.filter((t) => t.tags.includes(activeCategory));

  return (
    <>
      <div ref={container} className="flex h-full w-full gap-6 overflow-hidden bg-canvas p-6 font-sans">
        {/* ── Sidebar Categories ── */}
        <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
          <div className="border-b border-black/5 px-6 py-8">
            <h2 className="font-display text-lg font-extrabold text-ink">Template Library</h2>
            <p className="mt-1 text-[11px] font-medium text-ink-soft">Premium foundations for your next project.</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-faint">
              Categories
            </p>
            {CATEGORIES.map((cat) => (
              <button type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition-all duration-300 ease-[var(--ease-fluid)] ${
                  activeCategory === cat
                    ? "bg-black/[0.04] text-ink"
                    : "text-ink-soft hover:bg-black/[0.02] hover:text-ink active:scale-[0.98]"
                }`}
              >
                {activeCategory === cat && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex flex-1 flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
          {/* Top hero bar */}
          <header className="gsap-header shrink-0 px-12 py-12">
            <p className="mb-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint w-max bg-black/[0.03]">
              Start with a template
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
              Choose your design
            </h1>
          </header>

          {/* Cards grid */}
          <div className="flex-1 overflow-y-auto px-12 pb-24">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((meta) => {
                return (
                  <div
                    key={meta.id}
                    className="gsap-template-card group relative flex flex-col overflow-hidden rounded-[2rem] bg-shell p-2 shadow-[var(--shadow-diffused)] ring-1 ring-black/5 transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-1 hover:shadow-xl hover:ring-black/10"
                    onMouseEnter={() => setHoveredId(meta.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                  {/* Thumbnail */}
                  <div
                    className={`relative h-56 w-full cursor-pointer overflow-hidden rounded-[1.5rem] shadow-[var(--shadow-inner-bezel)] ${meta.accentBg}`}
                    onClick={() => setPreviewId(meta.id)}
                  >
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                    {/* Scaled-down live template preview */}
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
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 ease-[var(--ease-fluid)] hover:scale-110 hover:bg-white/30"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); handleUseTemplate(meta.id); }}
                        className="flex items-center gap-2 rounded-full bg-accent py-2 pl-6 pr-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 ease-[var(--ease-fluid)] hover:bg-accent-deep active:scale-[0.98]"
                      >
                        Use this
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 ease-[var(--ease-fluid)] group-hover:translate-x-1">
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center justify-between px-5 py-5">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base font-bold text-ink">{meta.name}</p>
                      <p className="mt-1 truncate text-[12px] font-medium text-ink-soft">{meta.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Full-screen preview modal ── */}
      {previewId && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="flex h-14 shrink-0 items-center justify-between bg-surface px-6 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => setPreviewId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <span className="font-display text-sm font-bold text-ink">
                {TEMPLATE_META.find((m) => m.id === previewId)?.name} — Preview
              </span>
            </div>
            <button type="button"
              onClick={() => { handleUseTemplate(previewId); setPreviewId(null); }}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-deep active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Use this template
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-canvas px-6 pt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-[1200px] overflow-hidden rounded-t-xl bg-white shadow-2xl ring-1 ring-black/5">
              <TemplateRenderer templateId={previewId} data={PREVIEW_DATA} />
            </div>
          </div>
        </div>
      )}

      {/* ── New Project modal overlay ── */}
      {creatingForId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreatingForId(null);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Name your project</h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Starting with <span className="font-semibold text-ink">{TEMPLATE_META.find(t => t.id === creatingForId)?.name}</span> template
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
    </div>
    </>
  );
}
