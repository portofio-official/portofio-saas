"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { PortfolioData } from "@/lib/portfolio/types";

// Warm, paper-toned palette — high-end editorial minimal look.
const INK = "#16150F";
const PAPER = "#FAF9F5";
const MUTED = "#75736A";
const FAINT = "#A9A697";
const LINE = "#E7E4D9";
const SURFACE = "#F1EFE7";

export function MinimalTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  // Track sections for the folio rail
  const sections = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (projects.length) list.push({ key: "work", label: "Selected Work" });
    if (experiences.length) list.push({ key: "experience", label: "Experience" });
    if (educations.length) list.push({ key: "education", label: "Education" });
    if (skills.length) list.push({ key: "capabilities", label: "Capabilities" });
    if (contact.email || contact.phone || socials.length) list.push({ key: "contact", label: "Contact" });
    return list;
  }, [projects.length, experiences.length, educations.length, skills.length, contact.email, contact.phone, socials.length]);

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
    // 1. Scroll Progress
    const onScroll = () => {
      const h = document.documentElement;
      // Use the closest scrollable container if we are in an editor preview, or document body
      const scrollable = h.scrollHeight - h.clientHeight;
      if (scrollable > 0) {
        setProgress((window.scrollY / scrollable) * 100);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Also attach to preview container if it exists
    const previewContainer = document.querySelector('.overflow-y-auto');
    if (previewContainer) {
      previewContainer.addEventListener("scroll", (e) => {
        const target = e.target as HTMLElement;
        const scrollable = target.scrollHeight - target.clientHeight;
        setProgress(scrollable > 0 ? (target.scrollTop / scrollable) * 100 : 0);
      }, { passive: true });
    }
    
    // 2. Active Section Spy
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

    // 3. Reveal Animations
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

  // Helper to add reveal classes
  const setRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const accentRing: React.CSSProperties = { ["--tw-ring-color" as never]: theme.accentColor };

  return (
    <div
      className={`${templateFontClass(theme.font)} relative min-h-screen font-light selection:bg-black/10`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {/* Reading progress rail */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent">
        <div
          className="h-full motion-safe:transition-[width] motion-safe:duration-150"
          style={{ width: `${progress}%`, backgroundColor: theme.accentColor }}
        />
      </div>

      {/* Fixed folio indicator */}
      {sections.length > 0 && (
        <div
          className="fixed bottom-8 left-8 z-40 hidden md:flex items-center text-xs font-mono tracking-widest uppercase"
          style={{ color: FAINT }}
          aria-hidden="true"
        >
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}</span>
          <span className="mx-3 w-4 h-[1px]" style={{ backgroundColor: LINE }} />
          <span>{sections[activeIndex]?.label}</span>
        </div>
      )}

      <div className="mx-auto max-w-[1000px] px-6 py-24 md:px-12 md:py-32">
        
        {/* Header / Bio */}
        <header className="mb-32 md:mb-48 max-w-3xl transform transition-all duration-1000 opacity-0 translate-y-6" ref={setRevealRef}>
          <div className="flex items-center gap-5 mb-12">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt={profile.fullName || "Profile photo"}
                className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover grayscale opacity-90 border"
                style={{ borderColor: LINE }}
              />
            ) : (
              <div
                className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full text-lg font-medium border"
                style={{ backgroundColor: SURFACE, color: MUTED, borderColor: LINE }}
              >
                {initials(profile.fullName)}
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-medium tracking-tight">
                {profile.fullName || "Your Name"}
              </h1>
              {profile.location && (
                <p className="text-sm mt-0.5" style={{ color: MUTED }}>
                  {profile.location}
                </p>
              )}
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-medium leading-[1.2] tracking-tight mb-8 text-[#111]">
            {profile.headline}
          </h2>
          {profile.bio && (
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl" style={{ color: MUTED }}>
              {profile.bio}
            </p>
          )}
        </header>

        {/* Selected Work */}
        {projects.length > 0 && (
          <section
            ref={(el) => {
              sectionRefs.current.work = el;
              setRevealRef(el);
            }}
            data-section-key="work"
            className="mb-32 md:mb-48 scroll-mt-24 transform transition-all duration-1000 delay-100 opacity-0 translate-y-6"
          >
            <div className="flex items-baseline justify-between mb-10 pb-4 border-b" style={{ borderColor: LINE }}>
              <h3 className="text-lg font-medium" style={{ color: MUTED }}>
                Selected Work
              </h3>
              <span className="text-xs font-mono tracking-widest hidden sm:inline" style={{ color: FAINT }}>
                {folio("work")}
              </span>
            </div>
            
            {/* Minimalist Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, i) => (
                <a
                  key={i}
                  href={project.link || undefined}
                  className="group flex flex-col rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 bg-white transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
                  style={{ borderColor: LINE, ...accentRing }}
                >
                  <div
                    className="aspect-[4/3] w-full overflow-hidden relative rounded-t-xl"
                    style={{ backgroundColor: SURFACE }}
                  >
                    {project.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover mix-blend-multiply motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-light" style={{ color: FAINT }}>
                        {project.title.charAt(0)}
                      </div>
                    )}
                    {/* Inner subtle border to simulate refraction */}
                    <div className="absolute inset-0 border border-black/5 rounded-t-xl pointer-events-none" />
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex items-baseline justify-between mb-2">
                      <h4 className="text-xl font-medium" style={{ color: INK }}>
                        {project.title}
                      </h4>
                      <span
                        className="text-sm motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        style={{ color: theme.accentColor }}
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                      {project.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section
            ref={(el) => {
              sectionRefs.current.experience = el;
              setRevealRef(el);
            }}
            data-section-key="experience"
            className="mb-32 md:mb-48 scroll-mt-24 transform transition-all duration-1000 opacity-0 translate-y-6"
          >
            <div className="flex items-baseline justify-between mb-10 pb-4 border-b" style={{ borderColor: LINE }}>
              <h3 className="text-lg font-medium" style={{ color: MUTED }}>
                Experience
              </h3>
              <span className="text-xs font-mono tracking-widest hidden sm:inline" style={{ color: FAINT }}>
                {folio("experience")}
              </span>
            </div>
            
            <div className="flex flex-col">
              {experiences.map((exp, i) => (
                <div key={i} className="py-8 border-b last:border-0" style={{ borderColor: LINE }}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
                    <div className="md:col-span-1">
                      <p className="text-sm font-mono tracking-wide" style={{ color: FAINT }}>
                        {formatMonth(exp.startDate)}<br className="hidden md:block" />
                        <span className="md:hidden"> — </span>
                        {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <h4 className="text-xl font-medium mb-1">{exp.role}</h4>
                      <p className="text-base mb-4" style={{ color: MUTED }}>
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: MUTED }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-32 md:mb-48">
          
          {/* Education */}
          {educations.length > 0 && (
            <section
              ref={(el) => {
                sectionRefs.current.education = el;
                setRevealRef(el);
              }}
              data-section-key="education"
              className="scroll-mt-24 transform transition-all duration-1000 opacity-0 translate-y-6"
            >
              <div className="flex items-baseline justify-between mb-10 pb-4 border-b" style={{ borderColor: LINE }}>
                <h3 className="text-lg font-medium" style={{ color: MUTED }}>
                  Education
                </h3>
                <span className="text-xs font-mono tracking-widest hidden sm:inline" style={{ color: FAINT }}>
                  {folio("education")}
                </span>
              </div>
              <div className="flex flex-col gap-8">
                {educations.map((edu, i) => (
                  <div key={i}>
                    <h4 className="text-lg font-medium mb-1">{edu.institution}</h4>
                    <p className="text-base mb-2" style={{ color: MUTED }}>
                      {edu.degree}
                    </p>
                    <p className="text-xs font-mono tracking-wide uppercase" style={{ color: FAINT }}>
                      {edu.startYear} — {edu.endYear || "Present"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Capabilities */}
          {skills.length > 0 && (
            <section
              ref={(el) => {
                sectionRefs.current.capabilities = el;
                setRevealRef(el);
              }}
              data-section-key="capabilities"
              className="scroll-mt-24 transform transition-all duration-1000 delay-100 opacity-0 translate-y-6"
            >
              <div className="flex items-baseline justify-between mb-10 pb-4 border-b" style={{ borderColor: LINE }}>
                <h3 className="text-lg font-medium" style={{ color: MUTED }}>
                  Capabilities
                </h3>
                <span className="text-xs font-mono tracking-widest hidden sm:inline" style={{ color: FAINT }}>
                  {folio("capabilities")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="px-3 py-1.5 text-xs font-mono tracking-wider uppercase rounded-full border" 
                    style={{ borderColor: LINE, backgroundColor: SURFACE, color: MUTED }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer / Colophon */}
        <footer
          ref={(el) => {
            sectionRefs.current.contact = el;
            setRevealRef(el);
          }}
          data-section-key="contact"
          className="pt-24 border-t scroll-mt-24 flex flex-col md:flex-row items-baseline justify-between gap-12 transform transition-all duration-1000 opacity-0 translate-y-6"
          style={{ borderColor: LINE }}
        >
          <div>
            {sections.length > 0 && (
              <span className="block text-xs font-mono tracking-widest uppercase mb-6" style={{ color: FAINT }}>
                {folio("contact")}
              </span>
            )}
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-8">Let&apos;s talk</h2>
            <div className="flex flex-col gap-4">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-lg md:text-xl w-fit pb-1 border-b motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 rounded-sm"
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
                <span className="text-lg font-mono" style={{ color: MUTED }}>
                  {contact.phone}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            {socials.map((social, i) => (
              <a
                key={i}
                href={social.url}
                aria-label={social.platform}
                className="w-12 h-12 flex items-center justify-center rounded-full border motion-safe:transition-all motion-safe:duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
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
        </footer>

      </div>
    </div>
  );
}
