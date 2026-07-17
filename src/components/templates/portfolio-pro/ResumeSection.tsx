"use client";
/* eslint-disable react-hooks/refs -- useDragScroll's ref is only ever read inside
   event handlers (onMouseDown/onMouseMove), never during render; the rule can't
   see through the custom-hook indirection. */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Star, X, ChevronRight } from "lucide-react";
import type { PortfolioProData } from "./schema";
import type { ColorScheme } from "./theme";
import { monogram, MONOGRAM_GRADIENTS } from "./theme";
import { useDragScroll } from "./useDragScroll";

type Tab = "education" | "experience" | "skills";
type Education = PortfolioProData["educationDetails"][number];
type Experience = PortfolioProData["experienceDetails"][number];
type SelectedItem = ({ type: "education" } & Education) | ({ type: "experience" } & Experience);

const TOOL_COLORS = ["#0f9d58", "#4285f4", "#db4437", "#f4b400", "#ab47bc", "#00acc1"];

function LogoBadge({ logoUrl, name, gradientIdx, size = "h-12 w-12 rounded-2xl text-[10px]" }: { logoUrl?: string; name: string; gradientIdx: number; size?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden font-black tracking-wider shadow-sm ${size} ${logoUrl ? "" : `bg-gradient-to-tr text-white ${MONOGRAM_GRADIENTS[gradientIdx % MONOGRAM_GRADIENTS.length]}`}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="h-full w-full object-contain" />
      ) : (
        monogram(name)
      )}
    </div>
  );
}

function TimelineNode({ isFirst, isLast, isDark, accent }: { isFirst: boolean; isLast: boolean; isDark: boolean; accent: string }) {
  return (
    <div className="relative mb-6 flex h-6 w-full items-center justify-center">
      {!isFirst && <div className={`absolute left-[-12px] right-1/2 h-[2px] ${isDark ? "bg-white/10" : "bg-slate-200"}`} />}
      {!isLast && <div className={`absolute left-1/2 right-[-12px] h-[2px] ${isDark ? "bg-white/10" : "bg-slate-200"}`} />}
      <div className="relative z-10 h-3.5 w-3.5 rounded-full border-[3px] shadow-sm transition-transform duration-300 group-hover:scale-125 sm:h-4 sm:w-4" style={{ backgroundColor: accent, borderColor: isDark ? "#111126" : "#ffffff" }} />
    </div>
  );
}

export function ResumeSection({
  educations,
  experiences,
  skills,
  isDark,
  theme,
  isMobileView,
}: {
  educations: PortfolioProData["educationDetails"];
  experiences: PortfolioProData["experienceDetails"];
  skills: PortfolioProData["skillsShowcase"];
  isDark: boolean;
  theme: ColorScheme;
  isMobileView: boolean;
}) {
  const [requestedTab, setRequestedTab] = useState<Tab>("education");
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const experienceDrag = useDragScroll();
  const educationDrag = useDragScroll();

  const allTabs: { id: Tab; label: string; count: number }[] = [
    { id: "education", label: "Education", count: educations.length },
    { id: "experience", label: "Experience", count: experiences.length },
    { id: "skills", label: "Skills & Tools", count: skills.length },
  ];
  const tabs = allTabs.filter((t) => t.count > 0);
  // Derived, not stored: falls back to the first available tab without an
  // effect+setState round-trip if the requested tab has no data.
  const activeTab = tabs.some((t) => t.id === requestedTab) ? requestedTab : (tabs[0]?.id ?? requestedTab);
  const setActiveTab = setRequestedTab;

  useEffect(() => {
    document.body.style.overflow = selectedItem ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedItem) setSelectedItem(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedItem]);

  if (!tabs.length) return null;

  return (
    <section id="resume" className="w-full scroll-mt-[72px] py-12 lg:py-16">
      <div className={`mx-auto grid w-full max-w-6xl gap-12 px-6 lg:gap-16 ${isMobileView ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
        <div className={`flex flex-col ${isMobileView ? "items-center space-y-3 text-center" : "space-y-4 text-left lg:sticky lg:top-28 lg:col-span-4 lg:self-start"}`}>
          <h2 className={`font-bold tracking-tight ${isMobileView ? "text-3xl" : "text-4xl lg:text-5xl"} ${isDark ? "text-white" : "text-slate-900"}`}>
            {activeTab === "skills" ? "Technical " : "My "}
            <span style={{ color: theme.accent }}>{activeTab === "education" ? "Education" : activeTab === "experience" ? "Experience" : "Skill"}</span>
          </h2>
          <p className={`leading-relaxed ${isMobileView ? "text-sm" : "text-base"} ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            {activeTab === "education"
              ? "The educational journey that built my professional foundation."
              : activeTab === "experience"
                ? "The career journey that shaped my experience and capabilities."
                : "A collection of technical skills supporting my professional work."}
          </p>
        </div>

        <div className={`flex flex-col ${isMobileView ? "w-full" : "lg:col-span-8"}`}>
          <div className={`hide-scrollbar mb-8 flex items-center gap-4 overflow-x-auto border-b pb-px sm:gap-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative -mb-px shrink-0 pb-3 text-sm whitespace-nowrap transition-colors sm:text-base ${isActive ? "font-bold" : `font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}`}
                  style={isActive ? { color: theme.accent } : undefined}
                >
                  {tab.label}
                  <span className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} style={{ backgroundColor: theme.accent }} />
                </button>
              );
            })}
          </div>

          <div className="min-h-[300px] w-full">
            {activeTab === "experience" && (
              <div
                ref={experienceDrag.ref}
                onMouseDown={experienceDrag.onMouseDown}
                onMouseLeave={experienceDrag.onMouseLeave}
                onMouseUp={experienceDrag.onMouseUp}
                onMouseMove={experienceDrag.onMouseMove}
                className="hide-scrollbar flex w-full cursor-grab gap-6 overflow-x-auto pb-6 select-none active:cursor-grabbing"
              >
                {experiences.map((item, idx) => (
                  <div key={idx} className="group relative flex w-[290px] shrink-0 flex-col items-center sm:w-[340px]">
                    <TimelineNode isFirst={idx === 0} isLast={idx === experiences.length - 1} isDark={isDark} accent={theme.accent} />
                    <div
                      onClick={() => {
                        if (!experienceDrag.wasDragged()) setSelectedItem({ type: "experience", ...item });
                      }}
                      className={`flex w-full cursor-pointer flex-col rounded-3xl border p-5 shadow-md transition-all duration-300 hover:-translate-y-1 sm:p-6 ${isMobileView ? "h-[350px]" : "h-[420px]"} ${isDark ? `${theme.darkCard} border-white/10` : "border-slate-100 bg-white"}`}
                    >
                      <div className="flex w-full items-center gap-3">
                        <LogoBadge logoUrl={item.logoUrl} name={item.company} gradientIdx={idx} />
                        <div className="flex min-w-0 flex-1 flex-col pr-2">
                          <h3 className={`truncate text-[14px] font-bold leading-tight sm:text-[15px] ${isDark ? "text-white" : "text-slate-900"}`}>{item.role}</h3>
                          <h4 className="mt-1.5 truncate text-[11px] font-medium sm:text-xs" style={{ color: theme.accent }}>{item.company}</h4>
                        </div>
                      </div>
                      <div className={`mx-auto mt-5 mb-1 h-px w-full ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                      <div className="mt-4 flex items-center gap-1.5">
                        <Calendar size={10} className={isDark ? "text-gray-400" : "text-slate-500"} />
                        <span className={`text-[10px] font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}>{item.period}</span>
                      </div>
                      {item.achievements[0] && (
                        <p className={`mt-1 mb-4 line-clamp-4 flex-1 text-xs leading-relaxed ${isDark ? "text-gray-300" : "text-slate-600"}`}>{item.achievements[0]}</p>
                      )}
                      {item.tools.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {item.tools.slice(0, 4).map((tool, ti) => (
                            <span
                              key={ti}
                              className="shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold"
                              style={{ backgroundColor: `${TOOL_COLORS[ti % TOOL_COLORS.length]}15`, borderColor: `${TOOL_COLORS[ti % TOOL_COLORS.length]}30`, color: TOOL_COLORS[ti % TOOL_COLORS.length] }}
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className={`mt-auto flex items-center justify-between border-t pt-4 ${isDark ? "border-white/5" : "border-slate-100"}`}>
                        <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                          Detail <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "education" && (
              <div
                ref={educationDrag.ref}
                onMouseDown={educationDrag.onMouseDown}
                onMouseLeave={educationDrag.onMouseLeave}
                onMouseUp={educationDrag.onMouseUp}
                onMouseMove={educationDrag.onMouseMove}
                className="hide-scrollbar flex w-full cursor-grab gap-6 overflow-x-auto pb-6 select-none active:cursor-grabbing"
              >
                {educations.map((item, idx) => (
                  <div key={idx} className="group relative flex w-[290px] shrink-0 flex-col items-center sm:w-[340px]">
                    <TimelineNode isFirst={idx === 0} isLast={idx === educations.length - 1} isDark={isDark} accent={theme.accent} />
                    <div
                      onClick={() => {
                        if (!educationDrag.wasDragged()) setSelectedItem({ type: "education", ...item });
                      }}
                      className={`flex w-full cursor-pointer flex-col rounded-3xl border p-5 shadow-md transition-all duration-300 hover:-translate-y-1 sm:p-6 ${isMobileView ? "h-[350px]" : "h-[420px]"} ${isDark ? `${theme.darkCard} border-white/10` : "border-slate-100 bg-white"}`}
                    >
                      <div className="flex w-full items-center gap-3">
                        <LogoBadge logoUrl={item.logoUrl} name={item.institution} gradientIdx={idx} />
                        <div className="flex min-w-0 flex-1 flex-col pr-2">
                          <h3 className={`truncate text-[14px] font-bold leading-tight sm:text-[15px] ${isDark ? "text-white" : "text-slate-900"}`}>{item.degree || item.institution}</h3>
                          <h4 className="mt-1.5 truncate text-[11px] font-medium sm:text-xs" style={{ color: theme.accent }}>{item.institution}</h4>
                        </div>
                      </div>
                      <div className={`mx-auto mt-5 mb-1 h-px w-full ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                      <div className="mt-4 flex items-center gap-1.5">
                        <Calendar size={10} className={isDark ? "text-gray-400" : "text-slate-500"} />
                        <span className={`text-[10px] font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}>{item.period}</span>
                      </div>
                      {item.gpa && (
                        <div className="mt-2 flex items-center gap-1">
                          <Star size={10} className="fill-amber-500 text-amber-500" />
                          <span className="text-[10px] font-bold text-amber-500">GPA: {item.gpa}</span>
                        </div>
                      )}
                      {item.achievements[0] && (
                        <p className={`mt-4 line-clamp-4 flex-1 text-xs leading-relaxed ${isDark ? "text-gray-300" : "text-slate-600"}`}>{item.achievements[0]}</p>
                      )}
                      <div className={`mt-auto flex items-center justify-between border-t pt-4 ${isDark ? "border-white/5" : "border-slate-100"}`}>
                        <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                          Detail <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "skills" && (
              <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3.5 rounded-2xl border p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 ${isDark ? `${theme.darkCard} border-white/10` : "border-slate-100 bg-white"}`}
                  >
                    <LogoBadge logoUrl={skill.logoUrl} name={skill.name} gradientIdx={idx} size="h-10 w-10 rounded-xl text-xs" />
                    <h3 className={`truncate text-[13px] font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{skill.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedItem &&
        typeof document !== "undefined" &&
        createPortal(
          <div onClick={() => setSelectedItem(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative flex w-full flex-col overflow-hidden rounded-3xl shadow-2xl ${isMobileView ? "max-h-[560px] max-w-[340px]" : "max-h-[85vh] max-w-2xl"} ${isDark ? `${theme.darkBg} border border-white/10` : "border border-slate-200 bg-slate-50"}`}
            >
              <div className={`flex shrink-0 items-center justify-between border-b p-6 sm:p-8 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <h3 className={`text-xl font-bold sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                  {selectedItem.type === "experience" ? "Work Experience Detail" : "Education Detail"}
                </h3>
                <button type="button" onClick={() => setSelectedItem(null)} className={`rounded-full p-2 transition-colors ${isDark ? "text-gray-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-200"}`}>
                  <X size={24} />
                </button>
              </div>
              <div className="hide-scrollbar flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex w-full items-center gap-3 sm:gap-5">
                    <LogoBadge
                      logoUrl={selectedItem.logoUrl}
                      name={selectedItem.type === "experience" ? selectedItem.company : selectedItem.institution}
                      gradientIdx={0}
                      size="h-12 w-12 rounded-2xl text-[11px] sm:h-16 sm:w-16 sm:text-sm"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className={`break-words text-base font-bold sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                        {selectedItem.type === "experience" ? selectedItem.role : selectedItem.degree || selectedItem.institution}
                      </h3>
                      <h4 className="mt-1.5 truncate text-xs font-medium sm:text-base" style={{ color: theme.accent }}>
                        {(selectedItem.type === "experience" ? selectedItem.company : selectedItem.institution)} • {selectedItem.period}
                      </h4>
                    </div>
                  </div>
                  <div className={`my-1 h-px w-full ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                  {selectedItem.achievements.length > 0 && (
                    <div className="mt-2">
                      <h5 className={`mb-3 text-sm font-bold sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>Achievements</h5>
                      <ul className={`list-outside list-disc space-y-2 pl-5 text-xs sm:text-sm ${isDark ? "text-gray-300 marker:text-gray-500" : "text-slate-600 marker:text-slate-400"}`}>
                        {selectedItem.achievements.map((a, ai) => <li key={ai} className="pl-1 leading-relaxed">{a}</li>)}
                      </ul>
                    </div>
                  )}
                  {selectedItem.type === "experience" && selectedItem.tools.length > 0 && (
                    <div className="mt-4">
                      <h5 className={`mb-3 text-sm font-bold sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>Tools</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tools.map((tool, ti) => (
                          <span
                            key={ti}
                            className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold shadow-sm sm:text-xs"
                            style={{ backgroundColor: `${TOOL_COLORS[ti % TOOL_COLORS.length]}15`, borderColor: `${TOOL_COLORS[ti % TOOL_COLORS.length]}30`, color: TOOL_COLORS[ti % TOOL_COLORS.length] }}
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
