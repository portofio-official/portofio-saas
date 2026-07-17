"use client";

import { useEffect, useRef, useState } from "react";
import type { PortfolioProData } from "./schema";
import type { WorkspaceProfile } from "@/lib/templates/definition";
import { DARK_CHROME, hexToRgba } from "./theme";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { ResumeSection } from "./ResumeSection";
import { CoursesSection } from "./CoursesSection";
import { ProjectsSection } from "./ProjectsSection";
import { GallerySection } from "./GallerySection";
import { ContactSection } from "./ContactSection";
import { FooterSection } from "./FooterSection";

// ── Main Template ──────────────────────────────────────────────────────────

export function PortfolioProTemplate({
  data,
}: {
  data: PortfolioProData;
  workspaceProfile: WorkspaceProfile;
}) {
  const [isDark, setIsDark] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const theme = { accent: data.theme.accentColor, ...DARK_CHROME };
  const isManualScrolling = useRef(false);

  useEffect(() => {
    function handleResize() {
      setIsMobileView(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll-spy: highlight the nav link for whichever section has scrolled
  // past the top of the viewport, mirroring the source design's behavior.
  const SECTION_IDS = ["home", "about", "projects", "resume", "courses", "activities", "contact"];
  useEffect(() => {
    function handleScroll() {
      if (isManualScrolling.current) return;
      let current = "home";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 250) current = id;
      }
      setActiveSection(current);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNavSelect(id: string) {
    isManualScrolling.current = true;
    setActiveSection(id);
    window.setTimeout(() => {
      isManualScrolling.current = false;
    }, 800);
  }

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden font-sans transition-colors duration-300 ${isDark ? `${theme.darkBg} text-zinc-100` : "bg-slate-50 text-zinc-900"}`}
      // `transform` here isn't decorative — it establishes a containing block so the
      // mobile nav drawer/backdrop (position: fixed) stay clipped inside this
      // template's own frame (the editor preview / gallery card mockup) instead of
      // escaping to the real page viewport. Same reason the main nav uses `sticky`
      // instead of `fixed`.
      style={{ "--pp-accent": theme.accent, transform: "translateZ(0)" } as React.CSSProperties}
    >
      {isDark && (
        <>
          <div className="pointer-events-none absolute top-[-2%] left-[-10%] z-0 h-96 w-96 rounded-full opacity-60 mix-blend-screen blur-[100px]" style={{ backgroundColor: hexToRgba(theme.accent, 0.35) }} />
          <div className="pointer-events-none absolute top-[15%] right-[-5%] z-0 h-[500px] w-[500px] rounded-full opacity-50 mix-blend-screen blur-[120px]" style={{ backgroundColor: hexToRgba(theme.accent, 0.25) }} />
          <div className="pointer-events-none absolute top-[45%] left-[-10%] z-0 h-[450px] w-[450px] rounded-full opacity-40 mix-blend-screen blur-[130px]" style={{ backgroundColor: hexToRgba(theme.accent, 0.3) }} />
          <div className="pointer-events-none absolute top-[75%] right-[-5%] z-0 h-[500px] w-[500px] rounded-full opacity-40 mix-blend-screen blur-[140px]" style={{ backgroundColor: hexToRgba(theme.accent, 0.25) }} />
        </>
      )}

      <Navbar
        fullName={data.profile.fullName || "Your Name"}
        isDark={isDark}
        toggleDark={() => setIsDark((v) => !v)}
        theme={theme}
        isMobileView={isMobileView}
        activeSection={activeSection}
        setActiveSection={handleNavSelect}
      />

      <main className={`relative z-10 mx-auto max-w-7xl px-6 ${isMobileView ? "pt-20" : "pt-24"}`}>
        <HeroSection profile={data.profile} hero={data.hero} contact={data.contact} socials={data.socials} isDark={isDark} theme={theme} isMobileView={isMobileView} />
        <AboutSection
          profile={data.profile}
          about={data.about}
          isDark={isDark}
          theme={theme}
          isMobileView={isMobileView}
          projectCount={data.caseStudies.length}
          certificateCount={data.certificates.length}
        />
        <ProjectsSection items={data.caseStudies} isDark={isDark} theme={theme} isMobileView={isMobileView} />
        <ResumeSection
          educations={data.educationDetails}
          experiences={data.experienceDetails}
          skills={data.skillsShowcase}
          isDark={isDark}
          theme={theme}
          isMobileView={isMobileView}
        />
        <CoursesSection items={data.certificates} isDark={isDark} theme={theme} isMobileView={isMobileView} />
      </main>
      <GallerySection items={data.gallery} theme={theme} isMobileView={isMobileView} />
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-6">
        <ContactSection contact={data.contact} socials={data.socials} isDark={isDark} isMobileView={isMobileView} />
      </div>
      <FooterSection profile={data.profile} contact={data.contact} isDark={isDark} theme={theme} isMobileView={isMobileView} />
    </div>
  );
}
