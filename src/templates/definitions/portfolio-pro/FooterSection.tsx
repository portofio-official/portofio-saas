"use client";

import type { PortfolioProData } from "./schema";
import type { ColorScheme } from "./theme";

const NAV_COLUMN_A = ["Home", "About", "Education", "Experience"];
const NAV_COLUMN_B = ["Skills", "Courses", "Projects"];

export function FooterSection({
  profile,
  contact,
  isDark,
  theme,
  isMobileView,
}: {
  profile: PortfolioProData["profile"];
  contact: PortfolioProData["contact"];
  isDark: boolean;
  theme: ColorScheme;
  isMobileView: boolean;
}) {
  const [firstName, ...restName] = (profile.fullName || "Your Name").split(" ");

  return (
    <footer className={`relative w-full text-sm ${isDark ? theme.darkCard : "bg-white"}`}>
      <div className="h-[3px] w-full opacity-60" style={{ background: `linear-gradient(to right, transparent, ${theme.accent}, transparent)` }} />
      <div className={`mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:gap-6 lg:py-16 ${isMobileView ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-12"}`}>
        <div className={`flex flex-col gap-6 ${isMobileView ? "" : `lg:col-span-4 lg:border-r lg:pr-10 ${isDark ? "lg:border-gray-800" : "lg:border-gray-200"}`}`}>
          <div className="shrink-0 pt-2 text-2xl font-bold tracking-wide">
            <span className={isDark ? "text-white" : "text-slate-900"}>{firstName} </span>
            <span style={{ color: theme.accent }}>{restName.join(" ")}</span>
          </div>
          {profile.bio && <p className={`max-w-xs pr-2 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>{profile.bio}</p>}
        </div>

        <div className={`flex flex-col gap-4 ${isMobileView ? "" : "lg:col-span-2 lg:col-start-6"}`}>
          <h4 className={`mb-2 font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Navigation</h4>
          {NAV_COLUMN_A.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className={`hover:underline ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item}</a>
          ))}
        </div>

        <div className={`flex flex-col gap-4 ${isMobileView ? "" : "lg:col-span-2"}`}>
          <h4 className={`mb-2 font-bold ${isDark ? "text-white" : "text-slate-900"}`}>More</h4>
          {NAV_COLUMN_B.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className={`hover:underline ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item}</a>
          ))}
        </div>

        {(contact.phone || contact.email) && (
          <div className={`flex flex-col gap-4 ${isMobileView ? "" : "lg:col-span-3"}`}>
            <h4 className={`mb-2 font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Contact</h4>
            {contact.phone && (
              <div className="flex flex-col gap-1">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Phone:</span>
                <a href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className={`hover:underline ${isDark ? "text-white" : "text-slate-900"}`}>{contact.phone}</a>
              </div>
            )}
            {contact.email && (
              <div className="flex flex-col gap-1">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Email:</span>
                <a href={`mailto:${contact.email}`} className={`break-all hover:underline ${isDark ? "text-white" : "text-slate-900"}`}>{contact.email}</a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`w-full px-6 py-5 ${theme.darkBg}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs font-medium text-white/90 md:flex-row">
          <p>Copyright © {new Date().getFullYear()} {profile.fullName || "Your Name"}. All Rights Reserved.</p>
          <p>Made with Portofyo</p>
        </div>
      </div>
    </footer>
  );
}
