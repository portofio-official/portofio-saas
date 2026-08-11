"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  DownloadSimple,
  List as Menu,
  X,
} from "@phosphor-icons/react";
import { SocialIcon, initials } from "@/templates/shared";
import type { PortfolioProData } from "./schema";
import type { WorkspaceProfile } from "@/templates/definition";
import { portfolioProDefinition } from "./definition";

// ─── Template-scoped motion & focus styles ───────────────────────────────────
// Kept inside the renderer so the published site works standalone without
// depending on app-only utility classes. Motion honours prefers-reduced-motion.
const PP_STYLE = `
.pp-reveal{opacity:0;transform:translateY(18px)}
@keyframes pp-pulse{0%,100%{opacity:.35}50%{opacity:1}}
.pp-pulse{animation:pp-pulse 2.6s ease-in-out infinite}
@keyframes pp-signal{0%{top:0;opacity:0}12%{opacity:1}88%{opacity:1}100%{top:calc(100% - 5px);opacity:0}}
.pp-signal{position:absolute;left:25px;width:5px;height:5px;border-radius:9999px;background:var(--pp-accent);opacity:0;animation:pp-signal 2.8s cubic-bezier(.4,0,.2,1) infinite}
.pp-focus:focus-visible{outline:2px solid var(--pp-accent);outline-offset:3px}
::selection{background:color-mix(in srgb, var(--pp-accent) 22%, transparent)}
@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  .pp-reveal{opacity:1!important;transform:none!important;transition:none!important}
  .pp-pulse,.pp-signal{animation:none!important}
}
`;

type Palette = (typeof portfolioProDefinition.variants)[number]["colors"];

type CSSVars = React.CSSProperties & { [key: `--${string}`]: string | number };

interface NavItem {
  id: string;
  label: string;
}

// Lightweight scroll reveal. Hidden until the element enters the viewport;
// forced visible under prefers-reduced-motion via the stylesheet above.
// Uses direct style writes (not state) so SSR and hydration stay stable and
// the no-IntersectionObserver path renders fully visible.
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => {
      el.style.opacity = "1";
      el.style.transform = "none";
    };
    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }
    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              reveal();
              io?.disconnect();
            }
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      io.observe(el);
    } catch {
      reveal();
    }
    return () => io?.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`pp-reveal ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionProperty: "opacity, transform",
        transitionDuration: "650ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: 0,
        transform: "translateY(18px)",
      }}
    >
      {children}
    </div>
  );
}

function useScrollSpy(idsKey: string): string {
  const [active, setActive] = useState("");
  const ids = useMemo(() => idsKey.split(",").filter(Boolean), [idsKey]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !ids.length) return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

// Minimal system-diagram hero visual: an inference pipeline in mono type.
// Functional (it states what the person works on), not a fake app screenshot.
function SignalDiagram({ colors }: { colors: Palette }) {
  const steps = [
    { label: "Input", status: "frames" },
    { label: "Processing", status: "preprocess" },
    { label: "Model", status: "inference" },
    { label: "Edge device", status: "on-device" },
    { label: "Result", status: "actionable" },
  ];
  return (
    <div
      className="relative border"
      style={
        {
          borderColor: colors.border,
          background: colors.surface,
          "--pp-accent": colors.primary,
        } as CSSVars
      }
    >
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: colors.border }}
      >
        <span
          className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase"
          style={{ color: colors.textMuted }}
        >
          Signal / Flow
        </span>
        <span
          className="flex items-center gap-2 font-mono text-[11px]"
          style={{ color: colors.textMuted }}
        >
          <span
            className="pp-pulse h-1.5 w-1.5 rounded-full"
            style={{ background: colors.primary }}
          />
          live
        </span>
      </div>
      <div className="relative px-6 py-7">
        <div
          className="absolute top-6 bottom-7 left-[28px] w-px"
          style={{ background: colors.border }}
        />
        <div className="pp-signal" />
        <div className="flex flex-col gap-7">
          {steps.map((step, i) => (
            <div key={step.label} className="relative flex items-center gap-5">
              <span
                className="relative z-10 h-2.5 w-2.5 shrink-0 rounded-full border"
                style={{
                  background: i % 2 === 0 ? colors.primary : colors.surface,
                  borderColor: colors.primary,
                }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: colors.text }}
              >
                {step.label}
              </span>
              <span
                className="ml-auto font-mono text-[11px]"
                style={{ color: colors.textMuted }}
              >
                {step.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteNav({
  name,
  items,
  colors,
}: {
  name: string;
  items: NavItem[];
  colors: Palette;
}) {
  const [open, setOpen] = useState(false);
  const active = useScrollSpy(items.map((item) => item.id).join(","));

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClasses = (id: string) =>
    `pp-focus rounded-sm px-3 py-1.5 text-sm transition-colors ${active === id ? "font-medium" : ""}`;

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{ borderColor: colors.border, background: colors.background }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a
          href="#hero"
          className="pp-focus flex items-center gap-3"
          style={{ color: colors.text }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-sm border font-mono text-xs font-bold"
            style={{ borderColor: colors.border, color: colors.primary }}
          >
            {initials(name)}
          </span>
          <span className="font-semibold tracking-tight">{name}</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={linkClasses(item.id)}
              style={
                active === item.id
                  ? { color: colors.primary }
                  : { color: colors.textMuted }
              }
            >
              {item.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="pp-focus flex h-9 w-9 items-center justify-center rounded-sm border md:hidden"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ background: colors.background }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex h-16 items-center justify-between border-b px-5"
            style={{ borderColor: colors.border }}
          >
            <span
              className="font-semibold tracking-tight"
              style={{ color: colors.text }}
            >
              {name}
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="pp-focus flex h-9 w-9 items-center justify-center rounded-sm border"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-1 px-5 pt-8">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="pp-focus border-b py-4 text-lg font-medium"
                style={{
                  borderColor: colors.border,
                  color: active === item.id ? colors.primary : colors.text,
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export function PortfolioProRenderer({
  data,
}: {
  data: PortfolioProData;
  workspaceProfile?: WorkspaceProfile;
}) {
  const hidden = (id: string) => data.hiddenSections?.includes(id) ?? false;
  const variant =
    portfolioProDefinition.variants.find(
      (item) => item.id === data.theme.variantId,
    ) || portfolioProDefinition.variants[0];
  const colors = variant.colors;
  const name = data.profile.fullName || "Your Name";

  const hasAbout = Boolean(
    data.about.paragraphs.length ||
    data.about.tags.length ||
    data.about.yearsExperience != null ||
    data.profile.photoUrl ||
    data.profile.bio,
  );
  const showAbout = !hidden("about") && hasAbout;
  const showWork = !hidden("caseStudies") && data.caseStudies.length > 0;
  const showExperience =
    !hidden("experienceDetails") && data.experienceDetails.length > 0;
  const showEducation =
    !hidden("educationDetails") && data.educationDetails.length > 0;
  const showSkills =
    !hidden("skillsShowcase") && data.skillsShowcase.length > 0;
  const showCerts = !hidden("certificates") && data.certificates.length > 0;
  const showResume = showExperience || showEducation || showSkills || showCerts;
  const showGallery = !hidden("gallery") && data.gallery.length > 0;
  const hasContactData = Boolean(
    data.contact.email || data.contact.phone || data.socials.length,
  );
  const showContact = !hidden("contact") && hasContactData;

  const navItems: NavItem[] = [
    { id: "about", label: "About", show: showAbout },
    { id: "work", label: "Work", show: showWork },
    { id: "resume", label: "Resume", show: showResume },
    { id: "gallery", label: "Gallery", show: showGallery },
    { id: "contact", label: "Contact", show: showContact },
  ]
    .filter((item) => item.show)
    .map(({ id, label }) => ({ id, label }));

  const focusTags = data.about.tags.slice(0, 3);

  return (
    <div
      className="min-h-screen"
      style={
        {
          background: colors.background,
          color: colors.text,
          "--pp-accent": colors.primary,
        } as CSSVars
      }
    >
      <style dangerouslySetInnerHTML={{ __html: PP_STYLE }} />

      <SiteNav name={name} items={navItems} colors={colors} />

      <main className="mx-auto max-w-7xl px-5 md:px-8">
        {!hidden("hero") && (
          <header
            id="hero"
            className="grid scroll-mt-24 gap-14 border-b pt-16 pb-20 md:pt-24 md:pb-28 lg:grid-cols-12 lg:gap-10 lg:items-end"
          >
            <div className="lg:col-span-7">
              <Reveal>
                <h1 className="max-w-[14ch] text-5xl leading-[1.02] font-semibold tracking-[-0.04em] md:text-6xl xl:text-7xl">
                  {name}
                </h1>
              </Reveal>
              {data.profile.headline && (
                <Reveal delay={80}>
                  <p
                    className="mt-6 max-w-[24ch] text-xl leading-snug md:text-2xl"
                    style={{ color: colors.textMuted }}
                  >
                    {data.profile.headline}
                  </p>
                </Reveal>
              )}
              {data.profile.bio && (
                <Reveal delay={140}>
                  <p
                    className="mt-6 max-w-[58ch] leading-relaxed"
                    style={{ color: colors.textMuted }}
                  >
                    {data.profile.bio}
                  </p>
                </Reveal>
              )}
              <Reveal delay={200}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  {data.hero.cvUrl && (
                    <a
                      href={data.hero.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pp-focus inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                      style={{
                        background: colors.text,
                        color: colors.background,
                      }}
                    >
                      <DownloadSimple size={17} />
                      Download CV
                    </a>
                  )}
                </div>
              </Reveal>
              <Reveal delay={260}>
                <p
                  className="mt-8 flex flex-wrap gap-x-3 gap-y-1 border-t pt-6 font-mono text-xs"
                  style={{
                    borderColor: colors.border,
                    color: colors.textMuted,
                  }}
                >
                  {data.profile.location && (
                    <span>{data.profile.location}</span>
                  )}
                  {data.profile.location && focusTags.length > 0 && (
                    <span className="opacity-50">/</span>
                  )}
                  {focusTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end lg:w-full lg:max-w-md">
              <Reveal delay={160} className="w-full">
                <SignalDiagram colors={colors} />
              </Reveal>
            </div>
          </header>
        )}

        {showAbout && (
          <section
            id="about"
            className="grid scroll-mt-24 gap-10 border-b py-20 md:py-28 lg:grid-cols-12 lg:gap-16"
          >
            <Reveal className="lg:col-span-4">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                About
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                {data.profile.photoUrl && (
                  <div
                    className="overflow-hidden border"
                    style={{ borderColor: colors.border }}
                  >
                    <img
                      src={data.profile.photoUrl}
                      alt={name}
                      className="aspect-[4/5] w-full max-w-sm object-cover"
                    />
                  </div>
                )}
                {data.about.yearsExperience != null && (
                  <p
                    className="font-mono text-xs"
                    style={{ color: colors.textMuted }}
                  >
                    {data.about.yearsExperience}+ years building software
                  </p>
                )}
              </div>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-8">
              <div className="flex max-w-3xl flex-col gap-6 text-lg leading-relaxed md:text-xl md:leading-relaxed">
                {(data.about.paragraphs.length > 0
                  ? data.about.paragraphs
                  : [data.profile.bio]
                )
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      className={
                        index === 0
                          ? "first-letter:text-3xl first-letter:leading-[1] first-letter:font-semibold first-letter:pr-1"
                          : ""
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
              {data.about.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                  {data.about.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border px-3 py-1.5 font-mono text-xs"
                      style={{
                        borderColor: colors.border,
                        color: colors.textMuted,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>
          </section>
        )}

        {showWork && (
          <section
            id="work"
            className="scroll-mt-24 border-b py-20 md:py-28"
            style={{ borderColor: colors.border }}
          >
            <Reveal>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Selected work
                </h2>
                <span
                  className="font-mono text-xs"
                  style={{ color: colors.textMuted }}
                >
                  {String(data.caseStudies.length).padStart(2, "0")} case
                  studies
                </span>
              </div>
            </Reveal>

            <div className="mt-6">
              {data.caseStudies.map((project, index) => (
                <Reveal key={project.title} delay={Math.min(index, 3) * 60}>
                  <article className="group grid scroll-mt-24 gap-8 border-t py-14 md:py-16 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:order-1 lg:col-span-7">
                      <p
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs"
                        style={{ color: colors.textMuted }}
                      >
                        <span style={{ color: colors.primary }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {project.category && <span>{project.category}</span>}
                        {project.date && <span>{project.date}</span>}
                        {project.confidential && (
                          <span
                            className="border px-2 py-0.5"
                            style={{
                              borderColor: colors.border,
                              color: colors.textMuted,
                            }}
                          >
                            confidential
                          </span>
                        )}
                      </p>
                      <h3 className="mt-5 text-2xl font-semibold tracking-tight decoration-1 underline-offset-8 group-hover:underline md:text-3xl">
                        {project.title}
                      </h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pp-focus mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-2.5"
                          style={{ color: colors.primary }}
                        >
                          Open case study
                          <ArrowUpRight size={16} />
                        </a>
                      )}
                      {project.description && (
                        <p
                          className="mt-6 max-w-[62ch] leading-relaxed"
                          style={{ color: colors.textMuted }}
                        >
                          {project.description}
                        </p>
                      )}
                      {project.achievements.length > 0 && (
                        <ul className="mt-6 space-y-2.5">
                          {project.achievements
                            .slice(0, 3)
                            .map((achievement) => (
                              <li
                                key={achievement}
                                className="flex gap-3 text-sm leading-relaxed"
                                style={{ color: colors.textMuted }}
                              >
                                <span
                                  className="mt-[7px] h-1.5 w-1.5 shrink-0"
                                  style={{ background: colors.primary }}
                                />
                                {achievement}
                              </li>
                            ))}
                        </ul>
                      )}
                      {project.tech.length > 0 && (
                        <div
                          className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          {project.tech.map((tech) => (
                            <span key={tech}>{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:order-2 lg:col-span-5">
                      {project.images[0] ? (
                        <div
                          className="relative aspect-[4/3] overflow-hidden border"
                          style={{ borderColor: colors.border }}
                        >
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex aspect-[4/3] flex-col justify-end gap-3 p-7"
                          style={{ background: colors.surface }}
                        >
                          <span
                            className="font-mono text-[11px] tracking-[0.18em] uppercase"
                            style={{ color: colors.textMuted }}
                          >
                            Case / {String(index + 1).padStart(2, "0")}
                          </span>
                          <h4 className="text-3xl font-semibold tracking-tight">
                            {project.title}
                          </h4>
                          {project.tech[0] && (
                            <span
                              className="font-mono text-xs"
                              style={{ color: colors.textMuted }}
                            >
                              {project.tech.slice(0, 4).join(" / ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {showResume && (
          <section
            id="resume"
            className="scroll-mt-24 border-b py-20 md:py-28"
            style={{ borderColor: colors.border }}
          >
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Resume
              </h2>
            </Reveal>

            {showExperience && (
              <div className="mt-10">
                <Reveal>
                  <h3
                    className="mb-2 text-sm font-semibold tracking-wide uppercase"
                    style={{ color: colors.textMuted }}
                  >
                    Experience
                  </h3>
                </Reveal>
                <div
                  className="border-t"
                  style={{ borderColor: colors.border }}
                >
                  {data.experienceDetails.map((experience, index) => (
                    <Reveal
                      key={`${experience.company}-${index}`}
                      delay={Math.min(index, 2) * 60}
                    >
                      <article
                        className="grid gap-3 border-b py-8 md:grid-cols-12"
                        style={{ borderColor: colors.border }}
                      >
                        <div className="md:col-span-3">
                          <p
                            className="font-mono text-xs"
                            style={{ color: colors.textMuted }}
                          >
                            {experience.period || "\u00A0"}
                          </p>
                        </div>
                        <div className="md:col-span-9">
                          <h4 className="text-lg font-semibold">
                            {experience.role}
                          </h4>
                          <p
                            className="mt-1 text-sm font-medium"
                            style={{ color: colors.primary }}
                          >
                            {experience.company}
                          </p>
                          {experience.achievements[0] && (
                            <p
                              className="mt-3 max-w-[65ch] text-sm leading-relaxed"
                              style={{ color: colors.textMuted }}
                            >
                              {experience.achievements[0]}
                            </p>
                          )}
                          {experience.tools.length > 0 && (
                            <div
                              className="mt-4 flex flex-wrap gap-2 font-mono text-xs"
                              style={{ color: colors.textMuted }}
                            >
                              {experience.tools.map((tool) => (
                                <span
                                  key={tool}
                                  className="border px-2 py-1"
                                  style={{ borderColor: colors.border }}
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {showEducation && (
              <div className="mt-16">
                <Reveal>
                  <h3
                    className="mb-2 text-sm font-semibold tracking-wide uppercase"
                    style={{ color: colors.textMuted }}
                  >
                    Education
                  </h3>
                </Reveal>
                <div
                  className="grid gap-x-16 gap-y-8 border-t pt-8 md:grid-cols-2"
                  style={{ borderColor: colors.border }}
                >
                  {data.educationDetails.map((education, index) => (
                    <Reveal
                      key={`${education.institution}-${index}`}
                      delay={Math.min(index, 2) * 60}
                    >
                      <div>
                        <p
                          className="font-mono text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          {education.period || "\u00A0"}
                        </p>
                        <h4 className="mt-2 text-base font-semibold">
                          {education.institution}
                        </h4>
                        {education.degree && (
                          <p
                            className="mt-1 text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            {education.degree}
                            {education.gpa ? ` / GPA ${education.gpa}` : ""}
                          </p>
                        )}
                        {education.achievements[0] && (
                          <p
                            className="mt-3 max-w-[55ch] text-sm leading-relaxed"
                            style={{ color: colors.textMuted }}
                          >
                            {education.achievements[0]}
                          </p>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {showSkills && (
              <div className="mt-16">
                <Reveal>
                  <h3
                    className="mb-2 text-sm font-semibold tracking-wide uppercase"
                    style={{ color: colors.textMuted }}
                  >
                    Skills
                  </h3>
                </Reveal>
                <div
                  className="grid gap-x-16 gap-y-4 border-t pt-8 md:grid-cols-2"
                  style={{ borderColor: colors.border }}
                >
                  {data.skillsShowcase.map((skill, index) => (
                    <Reveal
                      key={`${skill.name}-${index}`}
                      delay={Math.min(index, 5) * 40}
                    >
                      <div className="flex items-baseline gap-4">
                        <span
                          className="font-mono text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium">
                          {skill.name}
                        </span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {showCerts && (
              <div className="mt-16">
                <Reveal>
                  <h3
                    className="mb-2 text-sm font-semibold tracking-wide uppercase"
                    style={{ color: colors.textMuted }}
                  >
                    Certifications
                  </h3>
                </Reveal>
                <div
                  className="border-t pt-8"
                  style={{ borderColor: colors.border }}
                >
                  <ul className="grid gap-x-16 gap-y-4 md:grid-cols-2">
                    {data.certificates.map((certificate, index) => (
                      <li key={`${certificate.title}-${index}`}>
                        <p className="text-sm font-medium">
                          {certificate.title}
                        </p>
                        {(certificate.issuer || certificate.date) && (
                          <p
                            className="mt-0.5 font-mono text-xs"
                            style={{ color: colors.textMuted }}
                          >
                            {[certificate.issuer, certificate.date]
                              .filter(Boolean)
                              .join(" / ")}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        )}

        {showGallery && (
          <section
            id="gallery"
            className="scroll-mt-24 border-b py-20 md:py-28"
            style={{ borderColor: colors.border }}
          >
            <Reveal>
              <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Gallery
                </h2>
                <span
                  className="font-mono text-xs"
                  style={{ color: colors.textMuted }}
                >
                  {String(data.gallery.length).padStart(2, "0")} photos
                </span>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {data.gallery.map((photo, index) => (
                <Reveal
                  key={`${index}-${photo.imageUrl}`}
                  delay={Math.min(index, 3) * 60}
                  className={
                    index % 4 === 1 || index % 4 === 2 ? "md:mt-12" : ""
                  }
                >
                  <figure className="group">
                    {photo.imageUrl && (
                      <div
                        className="aspect-[3/4] overflow-hidden"
                        style={{ background: colors.surface }}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title || "Gallery photo"}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <figcaption
                      className="mt-3 font-mono text-[11px] leading-relaxed"
                      style={{ color: colors.textMuted }}
                    >
                      {[photo.title, photo.location, photo.date]
                        .filter(Boolean)
                        .join(" / ")}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {showContact && (
          <section
            id="contact"
            className="scroll-mt-24 border-b py-20 md:py-28"
            style={{ borderColor: colors.border }}
          >
            <Reveal>
              <h2 className="max-w-[16ch] text-4xl font-semibold tracking-tight md:text-5xl">
                Have an interesting problem?
              </h2>
              <p
                className="mt-5 max-w-[52ch] leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                Reach me directly and I will get back to you.
              </p>
              {data.contact.email && (
                <a
                  href={`mailto:${data.contact.email}`}
                  className="pp-focus mt-8 inline-block text-2xl font-medium underline-offset-8 md:text-3xl"
                  style={{ color: colors.primary }}
                >
                  {data.contact.email}
                </a>
              )}
              {(data.contact.phone || data.contact.whatsapp) && (
                <a
                  href={`https://wa.me/${(data.contact.whatsapp || data.contact.phone || "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pp-focus mt-3 block font-mono text-sm"
                  style={{ color: colors.textMuted }}
                >
                  {data.contact.phone || data.contact.whatsapp}
                </a>
              )}
            </Reveal>
            {data.socials.length > 0 && (
              <Reveal delay={80}>
                <div className="mt-12 flex flex-wrap gap-3">
                  {data.socials.map((social, index) => (
                    <a
                      key={`${social.platform}-${index}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="pp-focus flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:border-current"
                      style={{
                        borderColor: colors.border,
                        color: colors.textMuted,
                      }}
                    >
                      <SocialIcon platform={social.platform} size={18} />
                    </a>
                  ))}
                </div>
              </Reveal>
            )}
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="flex flex-col gap-3 border-t pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs" style={{ color: colors.textMuted }}>
            © {new Date().getFullYear()} {name}
          </p>
          <p className="font-mono text-xs" style={{ color: colors.textMuted }}>
            Built with Portofio
          </p>
        </div>
      </footer>
    </div>
  );
}

export { PortfolioProRenderer as PortfolioProTemplate };
