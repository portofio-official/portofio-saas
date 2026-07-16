"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/templates/types";
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
  const locale = useLocale();
  const router = useRouter();

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
      <div className="flex h-full w-full overflow-hidden bg-canvas font-sans">
        {/* ── Sidebar Categories ── */}
        <aside className="flex h-full w-56 shrink-0 flex-col border-r border-black/5 bg-surface">
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
              Categories
            </p>
            {CATEGORIES.map((cat) => (
              <button type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-black/[0.05] text-ink"
                    : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Top hero bar */}
          <header className="shrink-0 border-b border-black/5 bg-surface/80 px-8 py-6 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
              Templates
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">
              Start with a template
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Choose a design for your new project. You can change it later at any time.
            </p>
          </header>

          {/* Cards grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((meta) => {
                return (
                  <div
                    key={meta.id}
                    className={`group relative flex flex-col overflow-hidden rounded-xl bg-surface ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ring-black/5 hover:ring-black/10`}
                    onMouseEnter={() => setHoveredId(meta.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                  {/* Thumbnail */}
                  <div
                    className={`relative h-48 w-full cursor-pointer overflow-hidden ${meta.accentBg}`}
                    onClick={() => setPreviewId(meta.id)}
                  >
                    {/* Scaled-down live template preview */}
                    <div
                      className="pointer-events-none absolute inset-0 origin-top-left"
                      style={{ transform: "scale(0.35)", width: "285%", height: "285%" }}
                    >
                      <TemplateRenderer templateId={meta.id} data={PREVIEW_DATA} />
                    </div>

                    {/* Hover overlay */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/40 transition-opacity duration-200 ${
                        hoveredId === meta.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setPreviewId(meta.id); }}
                        className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        Preview
                      </button>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); handleUseTemplate(meta.id); }}
                        className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Use this
                      </button>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-ink">{meta.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-ink-faint">{meta.description}</p>
                    </div>
                    <button type="button"
                      onClick={() => handleUseTemplate(meta.id)}
                      className="ml-3 shrink-0 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-semibold text-ink-soft ring-1 ring-black/10 transition-all hover:bg-accent hover:text-accent hover:text-white"
                    >
                      Use
                    </button>
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
