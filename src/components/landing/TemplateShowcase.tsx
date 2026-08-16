"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import shared from "./shared.module.css";
import styles from "./TemplateShowcase.module.css";
import { PreviewTemplateRenderer as TemplateRenderer, TEMPLATE_CATALOG, TEMPLATE_CATEGORIES } from "@/templates/registry";
import { type TemplateId } from "@/templates/types";
import { type BasePortfolioData, BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { StudioData } from "@/templates/definitions/studio/schema";
import type { PortfolioProData } from "@/templates/definitions/portfolio-pro/schema";

type PreviewData = BasePortfolioData & Partial<StudioData> & Partial<PortfolioProData>;

// Single source of truth lives in src/templates/registry.tsx (derived from each
// template's own meta.gallery). Do NOT redefine template lists here.

const TEMPLATES = TEMPLATE_CATALOG;
const CATEGORIES = TEMPLATE_CATEGORIES;

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
};

export function TemplateShowcase() {
  const t = useTranslations("Landing.TemplateShowcase");
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isHovered, setIsHovered] = useState(false);

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

  /**
   * Isolates the template preview inside the modal: interactive template
   * elements (anchor links incl. hash/#, mailto:, wa.me, and the templates'
   * "back to top" buttons) must never do anything to the landing page behind
   * the overlay. We neutralise those clicks at the canvas container (capture
   * phase) so the preview is a dead interactive surface while remaining
   * scrollable, and the modal's own controls (close / viewport / CTA) keep
   * working because they live outside the canvas.
   */
  const isolatePreviewInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element | null;
    if (!target) return;
    const interactive = (target as Element).closest<HTMLElement>(
      "a[href], button, [role='button'], input, select, textarea, [tabindex]"
    );
    if (interactive) {
      e.preventDefault();
      e.stopPropagation();
    }
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

      {/* ─── Full-screen Preview Modal with Responsive Viewport Switcher ─── */}
      {previewId && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
          {/* Header Bar */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-white px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="Tutup (Esc)"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
              <div>
                <span className="font-display text-base font-bold text-gray-900">
                  {TEMPLATES.find((m) => m.id === previewId)?.name}
                </span>
                <span className="ml-2.5 rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Viewport Device Switcher */}
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-gray-100 p-1 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setViewportMode("desktop")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "desktop" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("tablet")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "tablet" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tablet_mac</span>
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewportMode === "mobile" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">smartphone</span>
                Mobile
              </button>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => {
                handleUseTemplate(previewId);
                setPreviewId(null);
              }}
              className="flex items-center gap-2 rounded-full bg-[#00cf7c] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#00b86e] active:scale-95"
            >
              Gunakan template ini
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Modal Main Viewport / Scroll Canvas */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start"
            onClickCapture={isolatePreviewInteraction}
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
    </section>
  );
}