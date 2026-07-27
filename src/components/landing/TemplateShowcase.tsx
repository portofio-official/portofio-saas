"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import shared from "./shared.module.css";
import styles from "./TemplateShowcase.module.css";
import { PreviewTemplateRenderer as TemplateRenderer } from "@/components/templates/registry";
import { type TemplateId } from "@/lib/templates/types";
import type { BasePortfolioData } from "@/lib/templates/schemas/_base";
import type { StudioData } from "@/components/templates/studio/schema";
import type { PortfolioProData } from "@/components/templates/portfolio-pro/schema";

type PreviewData = BasePortfolioData & Partial<StudioData> & Partial<PortfolioProData>;

interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  tags: string[];
  accentBg: string;
}

const TEMPLATES: TemplateMeta[] = [
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
    description: "Agency-tier design with asymmetrical bento grids & glass motion.",
    tags: ["All", "Creative", "Portfolio"],
    accentBg: "bg-[#050505]",
  },
  {
    id: "portfolio-pro",
    name: "Portfolio Pro",
    description: "Complete professional portfolio with case studies, certificates & gallery.",
    tags: ["All", "Professional", "Portfolio"],
    accentBg: "bg-[#0a0a0f]",
  },
];

const CATEGORIES = ["All", "Personal", "Creative", "Portfolio", "Professional", "Developer"];

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
};

export function TemplateShowcase() {
  const t = useTranslations("Landing.TemplateShowcase");
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("All");
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);

  const filteredTemplates = TEMPLATES.filter((tmpl) =>
    activeCategory === "All" ? true : tmpl.tags.includes(activeCategory)
  );

  // Duplicate for seamless 1-row circular marquee roll
  const rollingList = [...filteredTemplates, ...filteredTemplates];

  const handleUseTemplate = (id: TemplateId) => {
    router.push(`/signup?templateId=${id}`);
  };

  return (
    <section className={styles.templateShowcase} id="templates">
      <div className={`${shared.container} ${shared.revealOnScroll}`}>
        {/* Header */}
        <div className={styles.showcaseHeader}>
          <h2>{t("heading")}</h2>
          <p>{t("subheading")}</p>
        </div>

        {/* Category Pills */}
        <div className={styles.templateTabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`${styles.pillBtn} ${activeCategory === cat ? styles.active : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 1-Row Circular Marquee Rolling Carousel (Right to Left) ─── */}
      <div className={styles.carouselSection}>
        <div className={styles.marqueeViewport}>
          <div className={styles.marqueeTrack}>
            {rollingList.map((meta, idx) => (
              <div key={`${meta.id}-${idx}`} className={styles.templateCard}>
                {/* Live Preview Card Area */}
                <div
                  className={`${styles.cardPreviewArea} ${meta.accentBg}`}
                  onClick={() => setPreviewId(meta.id)}
                >
                  <div
                    className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ transform: "scale(0.32)", width: "310%", height: "310%" }}
                  >
                    <TemplateRenderer templateId={meta.id} data={PREVIEW_DATA} />
                  </div>

                  {/* Hover Overlay */}
                  <div className={styles.cardOverlay}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewId(meta.id);
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30"
                      title="Preview"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(meta.id);
                      }}
                      className="flex items-center gap-2 rounded-full bg-[#00cf7c] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-[#00b86e] active:scale-95"
                    >
                      Gunakan template
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Card Meta */}
                <div className={styles.cardFooter}>
                  <div className={styles.metaInfo}>
                    <h3>{meta.name}</h3>
                    <p>{meta.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Full-screen Preview Modal ─── */}
      {previewId && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-white px-8 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
              <span className="font-display text-base font-bold text-gray-900">
                {TEMPLATES.find((m) => m.id === previewId)?.name} — Live Preview
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                handleUseTemplate(previewId);
                setPreviewId(null);
              }}
              className="flex items-center gap-2 rounded-full bg-[#00cf7c] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#00b86e] active:scale-95"
            >
              Gunakan template ini
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto bg-gray-100 px-6 pt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-[1240px] overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <TemplateRenderer templateId={previewId} data={PREVIEW_DATA} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}