"use client";

import { useState, useEffect } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const filteredTemplates = TEMPLATES.filter((tmpl) =>
    activeCategory === "All" ? true : tmpl.tags.includes(activeCategory)
  );

  const total = filteredTemplates.length;

  // Auto-roll timer (rolls right to left continuously every 3.5 seconds)
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered, total]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handleUseTemplate = (id: TemplateId) => {
    router.push(`/signup?templateId=${id}`);
  };

  /**
   * Calculates 3D Circular Coverflow style for each card:
   * Edge cards are SMALL, center card is LARGE & focused.
   */
  const getCardStyle = (index: number) => {
    let offset = index - activeIndex;

    // Wrap around for circular loop
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;

    const isActive = offset === 0;
    const absOffset = Math.abs(offset);

    const translateX = offset * 280; // horizontal spacing between 1-row cards
    const scale = isActive ? 1.1 : Math.max(0.72, 1 - absOffset * 0.18);
    const opacity = isActive ? 1 : Math.max(0.2, 1 - absOffset * 0.35);
    const zIndex = 30 - absOffset * 10;
    const rotateY = offset * -12; // subtle 3D rolling angle

    return {
      transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity: absOffset > 2 ? 0 : opacity,
      zIndex,
      pointerEvents: absOffset > 2 ? ("none" as const) : ("auto" as const),
    };
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
              onClick={() => {
                setActiveCategory(cat);
                setActiveIndex(0);
              }}
              className={`${styles.pillBtn} ${activeCategory === cat ? styles.active : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3D Circular Coverflow Rolling Carousel (Edge Small, Center Large) ─── */}
      <div
        className={styles.coverflowContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.coverflowWrapper}>
          {filteredTemplates.map((meta, index) => {
            const isActive = index === activeIndex;
            const cardStyle = getCardStyle(index);

            return (
              <div
                key={meta.id}
                style={cardStyle}
                onClick={() => setActiveIndex(index)}
                className={`${styles.coverflowCard} ${isActive ? styles.active : ""}`}
              >
                {/* Live Preview Scaled Box */}
                <div className={`${styles.cardPreviewArea} ${meta.accentBg}`}>
                  <div
                    className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-700 ease-out"
                    style={{ transform: "scale(0.32)", width: "310%", height: "310%" }}
                  >
                    <TemplateRenderer templateId={meta.id} data={PREVIEW_DATA} />
                  </div>

                  {/* Hover Overlay for Active Card */}
                  <div className={styles.cardOverlay}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewId(meta.id);
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30"
                      title="Pratinjau"
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

                {/* Card Info */}
                <div className={styles.cardFooter}>
                  <div className={styles.metaInfo}>
                    <h3>{meta.name}</h3>
                    <p>{meta.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rolling Controls & Dots */}
        <div className={styles.coverflowControls}>
          <button
            type="button"
            onClick={handlePrev}
            className={styles.navArrow}
            aria-label="Previous template"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>

          <div className={styles.dotsContainer}>
            {filteredTemplates.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`${styles.dot} ${idx === activeIndex ? styles.activeDot : ""}`}
                aria-label={`Go to template slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className={styles.navArrow}
            aria-label="Next template"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
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