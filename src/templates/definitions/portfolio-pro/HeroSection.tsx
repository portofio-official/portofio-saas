"use client";

import { useState } from "react";
import { DownloadSimple, EnvelopeSimple, LinkedinLogo, WhatsappLogo } from "@phosphor-icons/react";
import type { PortfolioProData } from "./schema";
import type { ColorScheme } from "./theme";

// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
const Img = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />;



export function HeroSection({
  profile,
  hero,
  contact,
  socials,
  isDark,
  theme,
  isMobileView,
}: {
  profile: PortfolioProData["profile"];
  hero: PortfolioProData["hero"];
  contact: PortfolioProData["contact"];
  socials: PortfolioProData["socials"];
  isDark: boolean;
  theme: ColorScheme;
  isMobileView: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const linkedin = socials.find((s) => s.platform === "linkedin")?.url;

  return (
    <main
      id="home"
      className={`grid w-full scroll-mt-24 items-center ${isMobileView ? "mt-0 grid-cols-1 gap-6 pb-12" : "mt-0 min-h-[calc(100vh-120px)] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16"}`}
    >
      <div className={`relative z-10 flex flex-col justify-center ${isMobileView ? "order-last space-y-2" : "order-last space-y-5 lg:order-first lg:space-y-6"}`}>
        {profile.location && (
          <div className={`flex items-center gap-2.5 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-600"}`}>
            <span>📍</span>
            <span>{profile.location}</span>
          </div>
        )}
        <div className="w-full space-y-2 overflow-visible sm:space-y-3">
          <h1
            className={`leading-[1.1] font-bold tracking-tight whitespace-nowrap ${isMobileView ? "text-[22px]" : "text-[22px] min-[400px]:text-[28px] md:text-4xl lg:text-5xl xl:text-6xl"} ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {profile.fullName || "Your Name"}
          </h1>
          {profile.headline && (
            <h2
              className={`pb-0.5 leading-normal font-bold whitespace-nowrap sm:pb-1 ${isMobileView ? "text-[22px]" : "text-[22px] min-[400px]:text-[28px] md:text-4xl lg:text-5xl xl:text-6xl"}`}
              style={{ color: theme.accent }}
            >
              {profile.headline}
            </h2>
          )}
        </div>
        {profile.bio && (
          <p className={`max-w-lg leading-relaxed ${isMobileView ? "mt-0 text-sm" : "text-base"} ${isDark ? "text-gray-400" : "text-slate-600"}`}>{profile.bio}</p>
        )}
        <div className={`flex items-center ${isMobileView ? "!mt-[20px] flex-nowrap gap-2.5 pt-0" : "flex-wrap gap-4 pt-4"}`}>
          {hero.cvUrl && (
            <a
              href={hero.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-transform hover:scale-105 ${isMobileView ? "px-4 py-2.5 text-[13px] whitespace-nowrap" : "px-6 py-3 text-sm"}`}
              style={{ backgroundColor: theme.accent }}
            >
              <DownloadSimple size={isMobileView ? 16 : 18} />
              Download CV
            </a>
          )}
          <div className={`flex items-center ${isMobileView ? "gap-2" : "gap-3 sm:gap-4"}`}>
            {contact.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                title="WhatsApp"
                className={`flex items-center justify-center rounded-full transition-colors ${isMobileView ? "h-9 w-9" : "h-11 w-11"} ${isDark ? `${theme.darkElement} ${theme.darkElementHover} text-gray-400 hover:text-white` : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900"}`}
              >
                <WhatsappLogo size={isMobileView ? 16 : 18} />
              </a>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                title="Email"
                className={`flex items-center justify-center rounded-full transition-colors ${isMobileView ? "h-9 w-9" : "h-11 w-11"} ${isDark ? `${theme.darkElement} ${theme.darkElementHover} text-gray-400 hover:text-white` : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900"}`}
              >
                <EnvelopeSimple size={isMobileView ? 16 : 18} />
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                title="LinkedIn"
                className={`flex items-center justify-center rounded-full transition-colors ${isMobileView ? "h-9 w-9" : "h-11 w-11"} ${isDark ? `${theme.darkElement} ${theme.darkElementHover} text-gray-400 hover:text-white` : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900"}`}
              >
                <LinkedinLogo size={isMobileView ? 16 : 18} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={`relative flex w-full justify-center ${isMobileView ? "order-first items-start pt-0 pb-2" : "order-first min-h-[450px] items-start lg:order-last lg:min-h-[550px] lg:justify-center"}`}>
        {!isMobileView &&
          hero.badges.slice(0, 3).map((badge, i) => (
            <div
              key={i}
              title={badge.label}
              className={`absolute z-20 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-md ${isDark ? "border-white/10 bg-white/5" : "border-slate-200/20 bg-white/10"} ${
                ["animate-float-1 top-[5%] left-[15%]", "animate-float-2 top-32 right-8", "animate-float-3 bottom-16 left-10"][i]
              }`}
            >
              <Img src={badge.logoUrl} alt={badge.label ?? ""} className="h-8 w-8 object-contain" />
            </div>
          ))}

        <div
          className={`relative flex cursor-pointer flex-col items-center ${isMobileView ? "-mt-2 origin-top" : "-mt-10 origin-top lg:-mt-16"}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="animate-swing relative flex w-full origin-top flex-col items-center">
            <div
              className={`w-1.5 origin-top border-r-2 border-l-2 border-dashed ${isMobileView ? "h-8" : "h-24 lg:h-32"} ${isDark ? "border-gray-500/50 bg-gray-800/20" : "border-gray-400 bg-gray-200"}`}
              style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 35%)", maskImage: "linear-gradient(to bottom, transparent, black 35%)" }}
            />
            <div className={`z-10 -mt-1.5 rounded-full border-[3px] bg-transparent shadow-sm lg:border-4 ${isMobileView ? "h-4 w-4 border-gray-400/80" : "h-5 w-5 border-gray-400/80"}`} />
            <div className={`z-10 -mt-1 rounded-sm bg-gradient-to-b from-gray-300 to-gray-500 shadow-md ${isMobileView ? "h-5 w-2.5" : "h-6 w-3"}`} />

            <div className={`perspective-[1500px] group relative mt-[-4px] ${isMobileView ? "h-[320px] w-[220px]" : "h-[380px] w-[260px]"}`}>
              <div
                className="relative h-full w-full transition-transform duration-1000"
                style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                {/* FRONT */}
                <div
                  className={`absolute inset-0 flex flex-col overflow-hidden rounded-[1.5rem] border shadow-2xl transition-all duration-500 ${isDark ? `${theme.darkCard} border-white/10 shadow-black/50` : "border-slate-200 bg-white shadow-slate-300/50"}`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className={`absolute top-3 left-1/2 z-20 h-2.5 w-10 -translate-x-1/2 rounded-full shadow-inner ${isMobileView ? "top-2.5 h-2 w-8" : ""} ${isDark ? theme.darkBg : "bg-slate-100"}`} />
                  <div className={`relative mt-8 mr-4 mb-4 ml-4 flex-1 overflow-hidden rounded-xl ${isMobileView ? "mt-6 mr-3 mb-3 ml-3" : ""} ${isDark ? theme.darkBg : "bg-slate-100"}`}>
                    {profile.photoUrl ? (
                      <Img src={profile.photoUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-bold" style={{ color: theme.accent }}>
                        {(profile.fullName || "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`z-10 flex flex-col justify-center px-4 pb-7 text-center ${isMobileView ? "px-3 pb-5" : ""}`}>
                    <h3 className={`leading-none font-bold tracking-tight ${isMobileView ? "text-xl" : "text-2xl"}`} style={{ color: theme.accent }}>
                      {profile.headline || "Portfolio"}
                    </h3>
                  </div>
                </div>

                {/* BACK */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center rounded-[1.5rem] border shadow-2xl transition-all duration-500 ${isDark ? `${theme.darkCard} border-white/10 shadow-black/50` : "border-slate-200 bg-slate-50 shadow-slate-300/50"}`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className={`absolute top-3 left-1/2 z-20 h-2.5 w-10 -translate-x-1/2 rounded-full shadow-inner ${isMobileView ? "top-2.5 h-2 w-8" : ""} ${isDark ? theme.darkBg : "bg-slate-200"}`} />
                  <span className="text-8xl font-black opacity-[0.12]" style={{ color: theme.accent }}>
                    {(profile.fullName || "?").slice(0, 1).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
