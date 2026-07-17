"use client";

import { useEffect, useState } from "react";
import { List as Menu, X, Sun, Moon } from "@phosphor-icons/react";
import type { ColorScheme } from "./theme";

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "resume", label: "Experience" },
  { id: "courses", label: "Courses" },
  { id: "activities", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export function Navbar({
  fullName,
  isDark,
  toggleDark,
  theme,
  isMobileView,
  activeSection,
  setActiveSection,
}: {
  fullName: string;
  isDark: boolean;
  toggleDark: () => void;
  theme: ColorScheme;
  isMobileView: boolean;
  activeSection: string;
  setActiveSection: (id: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleNavClick(id: string) {
    setMobileOpen(false);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const [firstName, ...restName] = fullName.split(" ");

  return (
    <nav
      className={`sticky top-0 left-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${
        isDark ? "border-white/5 bg-black/40" : "border-slate-200/50 bg-slate-50/80"
      }`}
    >
      {/* Mobile backdrop */}
      {isMobileView && (
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      {isMobileView && (
        <div
          className={`fixed top-0 left-0 z-50 flex h-full w-[260px] flex-col shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${isDark ? `${theme.darkBg} border-r border-white/10` : "border-r border-slate-200 bg-slate-50"}`}
        >
          <div className={`flex h-[72px] items-center justify-between border-b px-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <span className={`text-xl font-bold tracking-wide ${isDark ? "text-white" : "text-slate-900"}`}>Menu</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${isDark ? "text-gray-300 hover:bg-white/10" : "text-slate-500 hover:bg-slate-200"}`}
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {NAV_LINKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`rounded-xl px-4 py-3 text-left text-base font-medium transition-colors ${
                  activeSection === item.id
                    ? isDark
                      ? `${theme.darkElement} text-white`
                      : "bg-slate-200 text-slate-900"
                    : isDark
                      ? "text-gray-300 hover:bg-white/10 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {isMobileView ? (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isDark ? `${theme.darkElement} text-gray-300` : "bg-slate-200 text-slate-700"}`}
          >
            <Menu size={20} />
          </button>
        ) : (
          <div className="shrink-0 text-2xl font-bold tracking-wide">
            <span className={isDark ? "text-white" : "text-slate-900"}>{firstName ? `${firstName} ` : "Your Name"}</span>
            <span style={{ color: theme.accent }}>{restName.join(" ")}</span>
          </div>
        )}

        {!isMobileView && (
          <div className={`ml-auto mr-4 flex items-center gap-1 text-sm font-medium lg:gap-2 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
            {NAV_LINKS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`group relative shrink-0 px-2 py-2 transition-all duration-300 lg:px-3 ${isActive ? "font-bold" : "font-medium"}`}
                  style={isActive ? { color: theme.accent } : undefined}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-300 ease-out ${isActive ? "w-1/2" : "w-0 group-hover:w-1/2"}`}
                    style={{ backgroundColor: theme.accent }}
                  />
                </button>
              );
            })}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 sm:ml-0 sm:gap-4">
          <button
            type="button"
            onClick={toggleDark}
            title={isDark ? "Light mode" : "Dark mode"}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9 ${isDark ? `${theme.darkElement} ${theme.darkElementHover} text-gray-300` : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
