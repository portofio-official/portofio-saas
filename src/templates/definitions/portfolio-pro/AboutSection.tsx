"use client";

import { useRef, useState } from "react";
import type { PortfolioProData } from "./schema";
import type { ColorScheme } from "./theme";

// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
const Img = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />;

export function AboutSection({
  profile,
  about,
  isDark,
  theme,
  isMobileView,
  projectCount,
  certificateCount,
}: {
  profile: PortfolioProData["profile"];
  about: PortfolioProData["about"];
  isDark: boolean;
  theme: ColorScheme;
  isMobileView: boolean;
  projectCount: number;
  certificateCount: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 });
  }

  const cardTransform = isHovered
    ? `perspective(1000px) rotateY(${mousePos.x * 25}deg) rotateX(${-mousePos.y * 25}deg) scale3d(1.02, 1.02, 1.02)`
    : "perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";

  if (!about.paragraphs.length && !profile.bio) return null;

  return (
    <section id="about" className="w-full scroll-mt-[110px] py-12 lg:py-16">
      <div className={`mx-auto grid w-full max-w-6xl items-center gap-16 px-6 lg:gap-24 ${isMobileView ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        <div className={`relative flex w-full justify-center ${isMobileView ? "order-first" : ""}`}>
          <div
            className={`absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-[3rem] opacity-40 blur-[60px] ${isMobileView ? "h-[350px] w-[280px]" : "h-[400px] w-[320px]"}`}
            style={{ backgroundColor: theme.accent }}
          />
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setMousePos({ x: 0, y: 0 });
            }}
            className={`relative z-10 flex cursor-pointer flex-col items-center overflow-hidden rounded-[2rem] shadow-2xl ${isMobileView ? "h-[440px] w-[310px]" : "h-[520px] w-[360px]"} ${isDark ? theme.darkCard : "bg-slate-900 shadow-slate-900/50"}`}
            style={{ transform: cardTransform, transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out" }}
          >
            {profile.photoUrl ? (
              <Img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)", maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)" }}
              />
            ) : (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-8xl font-black text-white opacity-20">
                {(profile.fullName || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div
              className={`pointer-events-auto absolute bottom-5 left-1/2 z-40 flex w-[calc(100%-2.5rem)] -translate-x-1/2 items-center justify-between rounded-2xl border p-3 backdrop-blur-xl ${isDark ? "border-white/10 bg-[#1D1E3A]/60" : "border-white/20 bg-white/10"}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-green-500 bg-slate-800">
                  {profile.photoUrl && <Img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />}
                  <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs leading-tight font-bold text-white drop-shadow-sm">{profile.fullName}</span>
                  <span className="mt-0.5 text-[10px] font-semibold text-green-400 drop-shadow-sm">Online</span>
                </div>
              </div>
              <a href="#contact" className="rounded-xl border border-white/10 bg-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/30">
                Contact Me
              </a>
            </div>
          </div>
        </div>

        <div className={`flex flex-col justify-center ${isMobileView ? "space-y-4" : "space-y-5"}`}>
          <h2 className={`font-bold tracking-tight ${isMobileView ? "text-3xl" : "text-4xl lg:text-5xl"} ${isDark ? "text-white" : "text-slate-900"}`}>
            About <span style={{ color: theme.accent }}>Me</span>
          </h2>
          <div className={`space-y-4 leading-relaxed ${isMobileView ? "text-sm" : "text-base"} ${isDark ? "text-gray-300" : "text-slate-600"}`}>
            {(about.paragraphs.length ? about.paragraphs : [profile.bio]).map((p, i) => p && <p key={i}>{p}</p>)}
          </div>
          {about.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {about.tags.map((tag, i) => (
                <span
                  key={i}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${isDark ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-300" : "border-slate-200 bg-slate-200/50 text-slate-700"}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className={`my-2 h-px w-full max-w-sm ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
          <div className="mt-1 mb-2 flex items-center gap-6 sm:gap-8">
            {about.yearsExperience !== undefined && (
              <div className="flex items-center gap-2.5">
                <h4 className="text-xl leading-none font-bold lg:text-2xl" style={{ color: theme.accent }}>{about.yearsExperience}+</h4>
                <span className={`text-[9px] leading-tight font-bold tracking-wider uppercase sm:text-[10px] ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                  Years<br />Experience
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <h4 className="text-xl leading-none font-bold lg:text-2xl" style={{ color: theme.accent }}>{projectCount}+</h4>
              <span className={`text-[9px] leading-tight font-bold tracking-wider uppercase sm:text-[10px] ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                Projects<br />Completed
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <h4 className="text-xl leading-none font-bold lg:text-2xl" style={{ color: theme.accent }}>{certificateCount}+</h4>
              <span className={`text-[9px] leading-tight font-bold tracking-wider uppercase sm:text-[10px] ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                Certificates<br />Earned
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
