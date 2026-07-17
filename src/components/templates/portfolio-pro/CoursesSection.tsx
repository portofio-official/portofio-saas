"use client";
/* eslint-disable react-hooks/refs -- see ResumeSection.tsx for why this is safe here. */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { PortfolioProData } from "./schema";
import type { ColorScheme } from "./theme";
import { useDragScroll } from "./useDragScroll";
import { MediaCard } from "./MediaCard";

type Certificate = PortfolioProData["certificates"][number];

export function CoursesSection({ items, isDark, theme, isMobileView }: { items: Certificate[]; isDark: boolean; theme: ColorScheme; isMobileView: boolean }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Certificate | null>(null);
  const [showAll, setShowAll] = useState(false);
  const drag = useDragScroll();

  useEffect(() => {
    document.body.style.overflow = selectedCourse || showAll ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCourse, showAll]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (selectedCourse) setSelectedCourse(null);
      else if (showAll) setShowAll(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCourse, showAll]);

  if (!items.length) return null;

  const issuers = ["All", ...Array.from(new Set(items.map((c) => c.issuer).filter((v): v is string => Boolean(v))))];
  const filtered = activeFilter === "All" ? items : items.filter((c) => c.issuer === activeFilter);

  return (
    <section id="courses" className="w-full scroll-mt-[72px] py-12 lg:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6">
        <div className={`mb-6 flex w-full flex-col gap-2 lg:mb-8 ${isMobileView ? "items-center text-center" : "text-left"}`}>
          <h2 className={`leading-tight font-bold tracking-tight ${isMobileView ? "text-3xl" : "text-4xl lg:text-5xl"} ${isDark ? "text-white" : "text-slate-900"}`}>
            Courses <span style={{ color: theme.accent }}>& Certificates</span>
          </h2>
          <p className={`leading-relaxed ${isMobileView ? "max-w-2xl text-sm" : "text-base"} ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            A collection of certifications supporting my professional development.
          </p>
        </div>

        <div className={`hide-scrollbar mb-2 flex gap-4 overflow-x-auto border-b sm:gap-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          {issuers.map((issuer) => {
            const isActive = activeFilter === issuer;
            return (
              <button
                key={issuer}
                type="button"
                onClick={() => setActiveFilter(issuer)}
                className={`relative shrink-0 pb-3 text-sm whitespace-nowrap sm:text-base ${isActive ? "font-bold" : `font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}`}
                style={isActive ? { color: theme.accent } : undefined}
              >
                {issuer}
              </button>
            );
          })}
        </div>

        <div
          ref={drag.ref}
          onMouseDown={drag.onMouseDown}
          onMouseLeave={drag.onMouseLeave}
          onMouseUp={drag.onMouseUp}
          onMouseMove={drag.onMouseMove}
          className="hide-scrollbar -mx-2 flex cursor-grab gap-6 overflow-x-auto px-2 pt-4 pb-4 select-none active:cursor-grabbing"
        >
          {filtered.map((course, i) => (
            <MediaCard
              key={i}
              pillLabel={course.issuer || "Certificate"}
              date={course.date}
              title={course.title}
              imageUrl={course.imageUrl}
              isDark={isDark}
              isGrid={false}
              onClick={() => {
                if (!drag.wasDragged()) setSelectedCourse(course);
              }}
            />
          ))}
        </div>

        {filtered.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={`mt-2 inline-flex w-max items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${isDark ? "bg-white/[0.06] text-white hover:bg-white/10" : "bg-black/[0.04] text-slate-900 hover:bg-black/[0.07]"}`}
          >
            Show all ({filtered.length})
          </button>
        )}
      </div>

      {showAll &&
        typeof document !== "undefined" &&
        createPortal(
          <div onClick={() => setShowAll(false)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl shadow-2xl ${isDark ? `${theme.darkBg} border border-white/10` : "border border-slate-200 bg-slate-50"}`}
            >
              <div className={`flex shrink-0 items-center justify-between border-b p-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  All Certificates {activeFilter !== "All" ? `- ${activeFilter}` : ""}
                </h3>
                <button type="button" onClick={() => setShowAll(false)} className={`rounded-full p-2 transition-colors ${isDark ? "text-gray-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-200"}`}>
                  <X size={24} />
                </button>
              </div>
              <div className="hide-scrollbar flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((course, i) => (
                    <MediaCard
                      key={i}
                      pillLabel={course.issuer || "Certificate"}
                      date={course.date}
                      title={course.title}
                      imageUrl={course.imageUrl}
                      isDark={isDark}
                      isGrid
                      onClick={() => setSelectedCourse(course)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {selectedCourse &&
        typeof document !== "undefined" &&
        createPortal(
          <div onClick={() => setSelectedCourse(null)} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl ${isDark ? `${theme.darkBg} border border-white/10` : "border border-slate-200 bg-slate-50"}`}
            >
              <div className={`flex shrink-0 items-center justify-between border-b p-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <h3 className={`truncate pr-4 text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedCourse.title}</h3>
                <button type="button" onClick={() => setSelectedCourse(null)} className={`shrink-0 rounded-full p-2 transition-colors ${isDark ? "text-gray-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-200"}`}>
                  <X size={24} />
                </button>
              </div>
              <div className={`relative w-full flex-1 ${isDark ? "bg-black/30" : "bg-slate-100"}`}>
                {selectedCourse.imageUrl && (
                  <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedCourse.imageUrl} alt={selectedCourse.title} className="max-h-full max-w-full object-contain drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
