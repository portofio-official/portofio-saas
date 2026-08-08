"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initials, SocialIcon } from "@/templates/shared";
import { TEMPLATE_FONT_VARIABLES } from "@/templates/fonts";
import type { CreativeData as PortfolioData } from "./schema";
import { creativeDefinition } from "./definition";
import type { WorkspaceProfile } from "@/templates/definition";

type StyleWithFont = React.CSSProperties & { fontFamily?: string };
const DISPLAY_STYLE: StyleWithFont = { fontFamily: "var(--tpl-font-rounded, Poppins, system-ui, sans-serif)" };
const MONO_STYLE: StyleWithFont = { fontFamily: "var(--tpl-font-mono, ui-monospace, 'SF Mono', monospace)" };

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-1"];

export function CreativeRenderer({ data }: { data: PortfolioData; workspaceProfile?: WorkspaceProfile }) {
  const { profile, projects, skills, testimonials, contact, socials, theme, hiddenSections } = data;

  const hidden = useCallback((id: string) => hiddenSections?.includes(id) ?? false, [hiddenSections]);
  const variant = creativeDefinition.variants.find(v => v.id === theme.variantId) || creativeDefinition.variants[0];
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
    if (skills.length && !hidden("skills")) list.push({ key: "skills", label: "Superpowers" });
    if (testimonials.length) list.push({ key: "testimonials", label: "Praise" });
    if ((contact.email || contact.phone || contact.whatsapp || socials.length) && !hidden("contact")) {
      list.push({ key: "contact", label: "Contact" });
    }
    return list;
  }, [projects.length, skills.length, testimonials.length, contact.email, contact.phone, contact.whatsapp, socials.length, hidden]);

  const folio = (key: string) => {
    const i = sections.findIndex((s) => s.key === key);
    if (i === -1) return null;
    return `N°${String(i + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;
  };

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const revealRefs = useRef<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      if (scrollable > 0) setProgress((window.scrollY / scrollable) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const previewContainer = document.querySelector(".overflow-y-auto");
    const onPreviewScroll = () => {
      const el = previewContainer as HTMLElement | null;
      if (!el) return;
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0);
    };
    if (previewContainer) previewContainer.addEventListener("scroll", onPreviewScroll, { passive: true });

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
          if (entry.isIntersecting || reduced) {
            entry.target.classList.add("translate-y-0", "opacity-100");
            entry.target.classList.remove("opacity-0");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    if (reduced) {
      revealRefs.current.forEach((el) => el && el.classList.add("translate-y-0", "opacity-100"));
    } else {
      revealRefs.current.forEach((el) => el && revealObserver.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (previewContainer) previewContainer.removeEventListener("scroll", onPreviewScroll);
      spyObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [sections]);

  const setRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const accentRing: React.CSSProperties = { ["--tw-ring-color" as never]: ACCENT };
  const whatsappDigits = contact.whatsapp?.replace(/\D/g, "");
  const year = new Date().getFullYear();
  const initialsBox = initials(profile.fullName || "AR");

  const sectionHeading = (label: string, key: string, showFolio = true) => (
    <div className="mb-12 flex items-center justify-between gap-6 border-b-2 pb-5" style={{ borderColor: LINE }}>
      <h2
        className="text-3xl md:text-5xl uppercase tracking-tight font-bold"
        style={{ ...DISPLAY_STYLE, letterSpacing: "-0.02em" }}
      >
        {label}
        <span className="ml-2 align-super text-sm font-normal" style={{ color: ACCENT }}>*</span>
      </h2>
      {showFolio && (
        <span className="hidden md:inline text-[11px] tracking-[0.2em] whitespace-nowrap" style={{ color: FAINT, ...MONO_STYLE }}>
          {folio(key)}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`relative min-h-screen ${TEMPLATE_FONT_VARIABLES} antialiased overflow-x-clip selection:bg-black/10`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent">
        <div className="h-full transition-[width] duration-150" style={{ width: `${progress}%`, backgroundColor: ACCENT }} />
      </div>

      {sections.length > 0 && (
        <div
          className="fixed bottom-8 right-7 z-40 hidden md:flex items-center gap-3 text-[11px] uppercase"
          style={{ color: FAINT, ...MONO_STYLE }}
          aria-hidden="true"
        >
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <span className="w-6 h-px" style={{ backgroundColor: LINE }} />
          <span>{sections[activeIndex]?.label}</span>
        </div>
      )}

      <main className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-14">
        {!hidden("profile") && (
          <header
            data-section-key="profile"
            className="relative pt-24 md:pt-32 pb-16 md:pb-24"
          >
            <div className="absolute -top-4 right-0 w-10 h-10 rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: ACCENT }} />
            <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.22em]" style={{ ...MONO_STYLE, color: MUTED }}>
              {profile.location && (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
                  {profile.location}
                </span>
              )}
              <span className="hidden sm:inline">/ Creative Portfolio</span>
              <span className="hidden sm:inline">/ est. {year}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <h1
                  className="uppercase font-black leading-[0.82] tracking-[-0.03em] text-balance"
                  style={{
                    ...DISPLAY_STYLE,
                    fontSize: "clamp(3.5rem, 12vw, 9rem)",
                  }}
                >
                  {profile.fullName || "Your Name"}
                  <span style={{ color: ACCENT }}>.</span>
                </h1>

                {profile.headline && (
                  <p
                    className="mt-7 text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight max-w-[22ch] text-balance"
                    style={{ ...DISPLAY_STYLE, color: MUTED }}
                  >
                    {profile.headline}
                  </p>
                )}

                {profile.bio && (
                  <p className="mt-6 max-w-[56ch] text-sm md:text-base leading-[1.8]" style={{ color: MUTED }}>
                    {profile.bio}
                  </p>
                )}

                <div className="mt-8 inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] transition-transform hover:scale-105" style={{ borderColor: LINE, color: INK, ...MONO_STYLE }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                  Open for commissions
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-start lg:justify-end">
                <div className="relative shrink-0">
                  <div
                    className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl border-2 -z-10"
                    style={{ borderColor: ACCENT }}
                  />
                  <div className={`w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-3xl ${profile.photoUrl ? "" : "border-2"} transform ${profile.photoUrl ? "rotate-2" : "-rotate-2"}`} style={{ backgroundColor: SURFACE, borderColor: LINE }}>
                    {profile.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.photoUrl} alt={profile.fullName || "Profile"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-6xl font-black" style={{ color: FAINT }}>
                        {initialsBox}
                      </div>
                    )}
                  </div>
                  <span
                    className="absolute -bottom-3 -left-6 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-lg rotate-[-4deg]"
                    style={{ backgroundColor: ACCENT, ...MONO_STYLE }}
                  >
                    Creator
                  </span>
                  <span
                    className="absolute -top-4 -right-5 text-7xl font-black"
                    style={{ color: ACCENT }}
                    aria-hidden="true"
                  >
                    ✳
                  </span>
                </div>
              </div>
            </div>
          </header>
        )}

        {projects.length > 0 && !hidden("projects") && (
          <section
            ref={(el) => { sectionRefs.current.work = el; setRevealRef(el); }}
            data-section-key="work"
            id="projects"
            className="py-16 md:py-24 opacity-0 translate-y-6 transition-all duration-1000"
          >
            {sectionHeading("Selected Work", "work")}
            <div className="flex flex-col">
              {projects.map((project, i) => {
                const reversed = i % 2 === 1;
                return (
                  <article
                    key={i}
                    data-section-type="projects"
                    data-item-index={i}
                    className="group grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center border-b py-12 md:py-16 first:border-t"
                    style={{ borderColor: LINE }}
                  >
                    <div className={`flex flex-col gap-4 md:col-span-7 md:row-start-1 ${reversed ? "md:col-start-6" : ""}`}>
                      <div className="flex items-baseline gap-5">
                        <span className="text-[11px] tracking-[0.18em] whitespace-nowrap" style={{ color: FAINT, ...MONO_STYLE }}>
                          /{String(i + 1).padStart(2, "0")}
                        </span>
                        <h3
                          className="text-3xl md:text-5xl font-bold tracking-tight leading-none underline-offset-[6px] decoration-2 group-hover:underline"
                          style={{ ...DISPLAY_STYLE, color: INK, textDecorationColor: ACCENT }}
                        >
                          {project.title}
                        </h3>
                      </div>
                      <p className="max-w-[46ch] text-sm md:text-base leading-relaxed" style={{ color: MUTED }}>
                        {project.description}
                      </p>
                      {project.link && (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors group-hover:border-transparent" style={{ borderColor: LINE, ...MONO_STYLE, color: MUTED }}>
                          View case{" "}
                          <span className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" style={{ color: ACCENT }}>↗</span>
                        </span>
                      )}
                    </div>

                    <a
                      href={project.link || undefined}
                      aria-label={project.title}
                      className={`relative block md:col-span-5 ${reversed ? "md:col-start-1 md:row-start-1" : "md:col-start-8 md:row-start-1"} group-hover:-translate-y-1 transition-transform duration-500`}
                    >
                      <div
                        className={`overflow-hidden rounded-[1.75rem] border-2 aspect-[16/10] ${ROTATIONS[i % ROTATIONS.length]} transition-transform duration-700 ease-out group-hover:rotate-0`}
                        style={{ backgroundColor: SURFACE, borderColor: LINE }}
                      >
                        {project.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-8xl font-black opacity-25" style={{ color: ACCENT }}>
                              {project.title.slice(0, 1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className="absolute -bottom-0 left-6 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                        style={{ ...MONO_STYLE }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {skills.length > 0 && !hidden("skills") && (
          <section
            ref={(el) => { sectionRefs.current.skills = el; setRevealRef(el); }}
            data-section-key="skills"
            id="skills"
            className="py-16 md:py-24 scroll-mt-12 opacity-0 translate-y-6 transition-all duration-1000"
          >
            {sectionHeading("Superpowers", "skills")}
            <div className="flex flex-wrap gap-3 md:gap-4">
              {skills.map((skill, i) => {
                const fill = i % 3 === 0 ? "solid" : i % 3 === 1 ? "ink" : "line";
                return (
                  <span
                    key={skill}
                    className={`inline-block px-6 py-3 text-base md:text-xl font-semibold rounded-full transition-transform duration-300 hover:rotate-0 hover:scale-105 cursor-default ${ROTATIONS[i % ROTATIONS.length]}`}
                    style={
                      fill === "solid"
                        ? { backgroundColor: ACCENT, color: "#fff" }
                        : fill === "ink"
                        ? { backgroundColor: INK, color: PAPER }
                        : { border: `2px solid ${LINE}`, color: INK, backgroundColor: "transparent" }
                    }
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {testimonials.length > 0 && !hidden("testimonials") && (
          <section
            ref={(el) => { sectionRefs.current.testimonials = el; setRevealRef(el); }}
            data-section-key="testimonials"
            id="testimonials"
            className="py-16 md:py-24 scroll-mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-10 opacity-0 translate-y-6 transition-all duration-1000"
          >
            <div>
              {(() => {
                const t = testimonials[0];
                return (
                  <div className="md:sticky md:top-6">
                    {sectionHeading("Praise", "testimonials", false)}
                    {t && (
                      <p className="text-2xl md:text-4xl font-medium tracking-tight leading-[1.2] max-w-[16ch] text-balance" style={{ ...DISPLAY_STYLE, color: INK }}>
                        &ldquo;{t.quote || t.body}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex flex-col gap-6 justify-center">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  data-section-type="testimonials"
                  data-item-index={i}
                  className={`flex items-center gap-5 rounded-2xl border-2 p-6 transition-transform duration-300 hover:scale-[1.02] ${ROTATIONS[i % ROTATIONS.length]}`}
                  style={{ backgroundColor: SURFACE, borderColor: LINE }}
                >
                  {t.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatarUrl} alt={t.name} className="h-14 w-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black/5 font-bold" style={{ color: INK }}>
                      {initials(t.name || "U")}
                    </div>
                  )}
                  <div className="min-w-0">
                    {typeof t.rating === "number" && t.rating > 0 && (
                      <div className="mb-1 text-sm tracking-widest" style={{ color: ACCENT }} aria-label={`${t.rating} out of 5`}>
                        {"★".repeat(Math.min(5, Math.round(t.rating)))}
                      </div>
                    )}
                    <p className="font-semibold leading-snug" style={{ color: INK }}>{t.name}</p>
                    {t.role && <p className="text-sm mt-0.5" style={{ color: MUTED }}>{t.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!hidden("contact") && (
          <footer
            ref={(el) => { sectionRefs.current.contact = el; setRevealRef(el); }}
            data-section-key="contact"
            id="contact"
            className="border-t-2 pt-16 md:pt-20 pb-10 scroll-mt-12 opacity-0 translate-y-6 transition-all duration-1000"
            style={{ borderColor: LINE }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-10">
              <div className="lg:col-span-7">
                <p className="mb-4 text-[11px] uppercase tracking-[0.2em]" style={{ color: FAINT, ...MONO_STYLE }}>
                  {folio("contact")}
                </p>
                <h2
                  className="font-black uppercase leading-[0.9] tracking-[-0.02em] text-[3.2rem] md:text-[5.5rem]"
                  style={{ ...DISPLAY_STYLE, color: INK }}
                >
                  Let&apos;s{" "}
                  <span className="relative inline-block">
                    talk
                    <span className="absolute left-0 right-0 bottom-1 h-3 -z-10" style={{ backgroundColor: ACCENT, opacity: 0.35 }} />
                  </span>
                </h2>

                <div className="mt-10 flex flex-col gap-5">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="group inline-flex w-fit items-center gap-3 rounded-full border px-5 py-3 text-base md:text-lg font-medium transition-colors"
                      style={{ borderColor: LINE, color: INK, ...accentRing }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = INK; }}
                    >
                      {contact.email}
                      <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="w-fit text-base md:text-lg" style={{ color: MUTED }}>
                      {contact.phone}
                    </a>
                  )}
                  {contact.whatsapp && whatsappDigits && (
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      className="group inline-flex w-fit items-center gap-3 text-base md:text-lg font-medium"
                      style={{ color: INK }}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110" style={{ backgroundColor: "#22c55e" }}>✉</span>
                      WhatsApp · {contact.whatsapp}
                    </a>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 lg:justify-self-end self-start mt-2">
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {socials.map((social, i) => (
                    <a
                      key={i}
                      href={social.url}
                      aria-label={social.platform}
                      className="flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
                      style={{ color: MUTED, borderColor: LINE, backgroundColor: SURFACE, ...accentRing }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = SURFACE; e.currentTarget.style.color = MUTED; }}
                    >
                      <SocialIcon platform={social.platform} size={19} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-between gap-4">
              <span className="text-[11px] tracking-[0.18em]" style={{ color: FAINT, ...MONO_STYLE }}>
                © {year} {profile.fullName || "Portofio"}
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
                className="text-[11px] uppercase tracking-[0.18em] transition-colors"
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

export { CreativeRenderer as CreativeTemplate };