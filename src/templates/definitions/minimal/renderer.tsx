"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initials, SocialIcon } from "@/templates/shared";
import { TEMPLATE_FONT_VARIABLES } from "@/templates/fonts";
import type { MinimalData } from "./schema";
import { minimalDefinition } from "./definition";
import type { WorkspaceProfile } from "@/templates/definition";

type StyleWithFont = React.CSSProperties & { fontFamily?: string };
const SERIF_STYLE: StyleWithFont = { fontFamily: "var(--tpl-font-serif, Georgia, 'Times New Roman', serif)" };
const MONO_STYLE: StyleWithFont = { fontFamily: "var(--tpl-font-mono, ui-monospace, 'SF Mono', monospace)" };

export function MinimalRenderer({ data }: { data: MinimalData; workspaceProfile?: WorkspaceProfile }) {
  const { profile, skills, projects, contact, socials, theme, hiddenSections } = data;

  const hidden = useCallback((id: string) => hiddenSections?.includes(id) ?? false, [hiddenSections]);
  const variant = minimalDefinition.variants.find(v => v.id === theme.variantId) || minimalDefinition.variants[0];
  const {
    primary: ACCENT,
    background: PAPER,
    surface: SURFACE,
    text: INK,
    textMuted: MUTED,
    border: LINE,
    faint: FAINT,
  } = variant.colors;

  const sections = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (projects.length && !hidden("projects")) list.push({ key: "work", label: "Selected Work" });
    if (skills.length && !hidden("skills")) list.push({ key: "capabilities", label: "Capabilities" });
    if ((contact.email || contact.phone || contact.whatsapp || socials.length) && !hidden("contact")) {
      list.push({ key: "contact", label: "Contact" });
    }
    return list;
  }, [projects.length, skills.length, contact.email, contact.phone, contact.whatsapp, socials.length, hidden]);

  const folio = (key: string) => {
    const i = sections.findIndex((s) => s.key === key);
    if (i === -1) return null;
    const total = String(sections.length).padStart(2, "0");
    return `N°${String(i + 1).padStart(2, "0")} / ${total}`;
  };

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const revealRefs = useRef<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const measure = (el: HTMLElement, overflowY: number) => {
      const scrollable = el.scrollHeight - el.clientHeight;
      return { scrollable, scrolled: overflowY };
    };
    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      if (scrollable > 0) {
        setProgress((window.scrollY / scrollable) * 100);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const previewContainer = document.querySelector('.overflow-y-auto');
    if (previewContainer) {
      previewContainer.addEventListener("scroll", (e) => {
        const target = e.target as HTMLElement;
        const { scrollable, scrolled } = measure(target, target.scrollTop);
        setProgress(scrollable > 0 ? (scrolled / scrollable) * 100 : 0);
      }, { passive: true });
    }

    const els = sections
      .map((s) => sectionRefs.current[s.key])
      .filter((el): el is HTMLElement => Boolean(el));

    const spyObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const key = visible.target.getAttribute("data-section-key");
          const idx = sections.findIndex((s) => s.key === key);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
    );
    els.forEach((el) => spyObserver.observe(el));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("translate-y-0", "opacity-100");
            entry.target.classList.remove("translate-y-6", "opacity-0");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    revealRefs.current.forEach((el) => {
      if (el) revealObserver.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      spyObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [sections]);

  const setRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const accentRing: React.CSSProperties = { ["--tw-ring-color" as never]: ACCENT };

  const whatsappDigits = contact.whatsapp?.replace(/\D/g, "");

  const sectionHeading = (label: string, key: string) => (
    <div className="mb-10 flex items-baseline justify-between pb-4 border-b" style={{ borderColor: LINE }}>
      <h3 className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: MUTED, ...MONO_STYLE }}>
        {label}
      </h3>
      <span className="text-[11px] tracking-[0.18em] hidden sm:inline" style={{ color: FAINT }}>
        {folio(key)}
      </span>
    </div>
  );

  return (
    <div
      className={`relative min-h-screen ${TEMPLATE_FONT_VARIABLES} antialiased selection:bg-black/10`}
      style={{ backgroundColor: PAPER, color: INK, ...SERIF_STYLE }}
    >
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent">
        <div
          className="h-full motion-safe:transition-[width] motion-safe:duration-150"
          style={{ width: `${progress}%`, backgroundColor: ACCENT }}
        />
      </div>

      {sections.length > 0 && (
        <div
          className="fixed bottom-8 left-8 z-40 hidden md:flex items-center gap-3 text-[11px] uppercase"
          style={{ color: FAINT }}
          aria-hidden="true"
        >
          <span className="font-normal" style={{ ...MONO_STYLE }}>{String(activeIndex + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}</span>
          <span className="w-6 h-px" style={{ backgroundColor: LINE }} />
          <span className="font-normal" style={{ ...MONO_STYLE }}>{sections[activeIndex]?.label}</span>
        </div>
      )}

      <main className="mx-auto max-w-[960px] px-6 py-24 md:px-12 md:py-32">
        {!hidden("profile") && (
          <header className="mb-20 md:mb-32 transform transition-all duration-1000 opacity-0 translate-y-6" ref={setRevealRef}>
            <div className="flex items-center gap-5 mb-14">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName || "Profile photo"}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover grayscale border"
                  style={{ borderColor: LINE }}
                />
              ) : (
                <div
                  className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full border text-lg font-light"
                  style={{ backgroundColor: SURFACE, color: MUTED, borderColor: LINE }}
                >
                  {initials(profile.fullName)}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl leading-tight tracking-tight">
                  {profile.fullName || "Your Name"}
                </h1>
                {profile.location && (
                  <p className="mt-1.5 text-sm" style={{ color: MUTED }}>
                    {profile.location}
                  </p>
                )}
              </div>
            </div>

            <h2 className="max-w-[16ch] text-[2.5rem] md:text-6xl leading-[1.05] tracking-[-0.02em] font-medium text-balance">
              {profile.headline}
            </h2>
            {profile.bio && (
              <p className="mt-8 max-w-[60ch] text-base md:text-lg leading-[1.8]" style={{ color: MUTED }}>
                {profile.bio}
              </p>
            )}
          </header>
        )}

        {projects.length > 0 && !hidden("projects") && (
          <section
            ref={(el) => {
              sectionRefs.current.work = el;
              setRevealRef(el);
            }}
            data-section-key="work"
            className="mb-20 md:mb-32 scroll-mt-24"
          >
            {sectionHeading("Selected Work", "work")}
            <div className="flex flex-col">
              {projects.map((project, i) => (
                <a
                  key={i}
                  href={project.link || undefined}
                  className="group flex flex-col gap-4 border-b py-8 md:py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 rounded-sm"
                  style={{ borderColor: LINE, ...accentRing }}
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <h4 className="flex items-baseline gap-4 text-2xl md:text-3xl font-medium tracking-tight leading-snug">
                      <span className="text-[11px] tracking-[0.18em]" style={{ color: FAINT, ...MONO_STYLE }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="group-hover:underline underline-offset-[6px] decoration-[1.5px]">
                        {project.title}
                      </span>
                    </h4>
                    {project.link && (
                      <span
                        className="text-lg shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
                        style={{ color: ACCENT }}
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    )}
                  </div>
                  <p className="max-w-[52ch] text-sm md:text-base leading-relaxed" style={{ color: MUTED }}>
                    {project.description}
                  </p>
                  {project.imageUrl && (
                    <div className="mt-2 overflow-hidden rounded-xl ring-1 transition-shadow duration-500 ease-out group-hover:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)]" style={{ ["--tw-ring-color" as never]: LINE }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
                      />
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && !hidden("skills") && (
          <section
            ref={(el) => {
              sectionRefs.current.capabilities = el;
              setRevealRef(el);
            }}
            data-section-key="capabilities"
            className="mb-20 md:mb-32 scroll-mt-24"
          >
            {sectionHeading("Capabilities", "capabilities")}
            <div className="flex flex-wrap gap-x-10 gap-y-5">
              {skills.map((skill, i) => (
                <span key={skill} className="flex items-baseline gap-3">
                  <span className="text-[10px] tracking-[0.18em]" style={{ color: FAINT, ...MONO_STYLE }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg md:text-xl">{skill}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {!hidden("contact") && (
          <footer
            ref={(el) => {
              sectionRefs.current.contact = el;
              setRevealRef(el);
            }}
            data-section-key="contact"
            className="border-t pt-16 md:pt-20 scroll-mt-24"
            style={{ borderColor: LINE }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
              <div className="md:col-span-8">
                {sections.length > 0 && (
                  <p className="mb-6 text-[11px] uppercase tracking-[0.2em]" style={{ color: FAINT, ...MONO_STYLE }}>
                    {folio("contact")}
                  </p>
                )}
                <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.02] text-balance">
                  Let&apos;s talk
                </h2>
                <div className="mt-10 flex flex-col gap-4">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="w-fit border-b pb-1 text-lg md:text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 rounded-sm"
                      style={{ color: MUTED, borderColor: LINE, ...accentRing }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = INK;
                        e.currentTarget.style.borderColor = INK;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = MUTED;
                        e.currentTarget.style.borderColor = LINE;
                      }}
                    >
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <span className="text-lg md:text-xl" style={{ color: MUTED }}>
                      {contact.phone}
                    </span>
                  )}
                  {contact.whatsapp && whatsappDigits && (
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      className="w-fit border-b pb-1 text-lg md:text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 rounded-sm"
                      style={{ color: MUTED, borderColor: LINE, ...accentRing }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = INK;
                        e.currentTarget.style.borderColor = INK;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = MUTED;
                        e.currentTarget.style.borderColor = LINE;
                      }}
                    >
                      WhatsApp · {contact.whatsapp}
                    </a>
                  )}
                </div>
              </div>

              <div className="md:col-span-4 md:justify-self-end self-start mt-2">
                <div className="flex gap-4">
                  {socials.map((social, i) => (
                    <a
                      key={i}
                      href={social.url}
                      aria-label={social.platform}
                      className="w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
                      style={{ color: MUTED, borderColor: LINE, backgroundColor: SURFACE, ...accentRing }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = INK;
                        e.currentTarget.style.borderColor = INK;
                        e.currentTarget.style.backgroundColor = PAPER;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = MUTED;
                        e.currentTarget.style.borderColor = LINE;
                        e.currentTarget.style.backgroundColor = SURFACE;
                      }}
                    >
                      <SocialIcon platform={social.platform} size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 md:mt-20 flex flex-wrap items-baseline justify-between gap-4">
              <span className="text-[11px] tracking-[0.18em]" style={{ color: FAINT, ...MONO_STYLE }}>
                {profile.fullName ? `© ${new Date().getFullYear()} ${profile.fullName}` : `© ${new Date().getFullYear()}`}
              </span>
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  const scroller = e.currentTarget.closest(".overflow-y-auto") as HTMLElement | null;
                  if (scroller) {
                    scroller.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-[11px] tracking-[0.18em] transition-colors"
                style={{ color: MUTED, ...MONO_STYLE }}
              >
                Back to top ↑
              </a>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

// Keep export default as MinimalTemplate for backward compatibility during phase transition
export { MinimalRenderer as MinimalTemplate };