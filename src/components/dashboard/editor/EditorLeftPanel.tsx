"use client";

import type { ReactNode } from "react";
import type { EditorData } from "./types";

export interface SectionListItem {
  id: string;
  label: string;
  description?: string;
}

export interface EditorLeftPanelProps {
  activeLeftTab: "content" | "sections";
  setActiveLeftTab: (tab: "content" | "sections") => void;
  expandedSection: string | null;
  setExpandedSection: (id: string | null) => void;
  sections: SectionListItem[];
  data: EditorData;
  setData: React.Dispatch<React.SetStateAction<EditorData>>;
  scrollToSection: (sectionKey: string) => void;
  renderSectionForm: (sectionId: string) => ReactNode;
  mobileLeftOpen: boolean;
  setMobileLeftOpen: (open: boolean) => void;
  definitionLabel: (id: string) => string;
}

export function EditorLeftPanel(props: EditorLeftPanelProps) {
  const {
    activeLeftTab,
    setActiveLeftTab,
    expandedSection,
    setExpandedSection,
    sections,
    data,
    setData,
    scrollToSection,
    renderSectionForm,
    mobileLeftOpen,
    setMobileLeftOpen,
    definitionLabel,
  } = props;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-[300px] shrink-0 flex-col border-r border-black/5 bg-surface shadow-md transition-transform duration-300 ease-out lg:static lg:z-auto ${
        mobileLeftOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <>
        <div className="flex h-[52px] shrink-0 items-end px-5 border-b border-black/5 gap-6">
          <button
            onClick={() => setActiveLeftTab("content")}
            className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
              activeLeftTab === "content"
                ? "border-accent text-accent"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveLeftTab("sections")}
            className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
              activeLeftTab === "sections"
                ? "border-accent text-accent"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            Sections
          </button>
          <button
            type="button"
            onClick={() => setMobileLeftOpen(false)}
            className="lg:hidden ml-auto mb-2.5 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-black/5 hover:text-ink transition-colors"
            aria-label="Close panel"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          {activeLeftTab === "content" ? (
            <div className="flex flex-col h-full overflow-y-auto scrollbar-thin pb-6 pr-2 relative">
              {/* Sticky Context Header */}
              <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md pb-4 pt-1 mb-4 border-b border-black/5 -mt-2">
                <span className="text-[10px] font-bold text-ink-soft uppercase tracking-[0.05em]">
                  {expandedSection ? "Editing" : "Select to Edit"}
                </span>
                <h2 className="text-sm font-bold text-ink mt-0.5">
                  {expandedSection
                    ? definitionLabel(expandedSection)
                    : "Content Overview"}
                </h2>
              </div>

              {/* Portfolio Completion Progress */}
              {(() => {
                const tasks = [
                  { id: "profile", label: "Add Name", done: !!data.profile?.fullName },
                  { id: "profile", label: "Upload Photo", done: !!data.profile?.photoUrl },
                  { id: "projects", label: "Add a Project", done: !!data.projects?.length },
                  { id: "skills", label: "Add a Skill", done: !!data.skills?.length },
                ];
                const completed = tasks.filter((t) => t.done).length;
                const progress = Math.round((completed / tasks.length) * 100);

                if (progress === 100) return null;

                return (
                  <div className="flex flex-col gap-3 mb-6 p-4 rounded-[1.5rem] bg-accent/[0.03] border border-accent/10 shadow-sm transition-all">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-ink">Setup Progress</h3>
                        <span className="text-[11px] text-ink-soft">{completed} of {tasks.length} completed</span>
                      </div>
                      <span className="text-[14px] font-black text-accent">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      {tasks.filter((t) => !t.done).slice(0, 1).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            setExpandedSection(task.id);
                          }}
                          className="text-[11px] font-bold text-accent/80 hover:text-accent flex items-center justify-between group transition-colors"
                        >
                          <span>Next: {task.label}</span>
                          <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0">arrow_forward</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-3">
                {sections.map((section) => {
                  let icon = "article";
                  let displayLabel = section.label;

                  if (section.id === "profile" || section.id === "hero" || section.id === "about") {
                    icon = "person";
                    if (section.id === "hero") displayLabel = "Introduction";
                    if (section.id === "profile") displayLabel = "Personal Details";
                  } else if (
                    section.id === "projects" ||
                    section.id === "work" ||
                    section.id === "case-studies" ||
                    section.id === "caseStudies"
                  ) {
                    icon = "work";
                  } else if (section.id === "contact") {
                    icon = "mail";
                  } else if (section.id === "socials") {
                    icon = "link";
                  } else if (
                    section.id === "skills" ||
                    section.id === "capabilities" ||
                    section.id === "expertise" ||
                    section.id === "skillsShowcase"
                  ) {
                    icon = "star";
                  } else if (section.id === "experience" || section.id === "experienceDetails") {
                    icon = "history";
                  } else if (section.id === "education" || section.id === "educationDetails") {
                    icon = "school";
                  } else if (section.id === "pricing") {
                    icon = "payments";
                  } else if (section.id === "testimonials") {
                    icon = "forum";
                  } else if (section.id === "gallery" || section.id === "certificates") {
                    icon = "image";
                  }

                  const isExpanded = expandedSection === section.id;

                  return (
                    <div
                      id={`accordion-${section.id}`}
                      key={section.id}
                      className={`flex flex-col rounded-[1rem] bg-white ring-1 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isExpanded ? "ring-accent/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] my-1" : "ring-black/5 hover:ring-black/10"
                      }`}
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedSection(null);
                          } else {
                            setExpandedSection(section.id);
                            scrollToSection(section.id);
                          }
                        }}
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                          isExpanded ? "bg-accent/[0.02] border-b border-black/5" : "hover:bg-black/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors duration-300 ${
                            isExpanded ? "bg-accent/10 text-accent" : "bg-black/5 text-ink-soft"
                          }`}>
                            <span className="material-symbols-outlined text-[16px]">{icon}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-[13px] font-bold transition-colors ${isExpanded ? "text-accent" : "text-ink"}`}>
                              {displayLabel}
                            </span>
                            {!isExpanded && section.description && (
                              <span className="text-[11px] text-ink-soft line-clamp-1">{section.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded && (
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                              Editing
                            </span>
                          )}
                          <span className={`material-symbols-outlined text-[18px] text-ink-soft transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                        </div>
                      </div>

                      {/* Accordion Body */}
                      <div
                        className={`grid transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-5 bg-surface/50">
                            {renderSectionForm(section.id)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Section Button */}
                <button className="flex items-center justify-center gap-2 mt-2 w-full rounded-[1rem] border-2 border-dashed border-accent/20 py-3 text-[13px] font-bold text-accent transition-all hover:bg-accent/5 hover:border-accent/40">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add section
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full p-1">
              <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md pb-4 pt-1 mb-4 border-b border-black/5 -mt-2">
                <span className="text-[10px] font-bold text-ink-soft uppercase tracking-[0.05em]">Layout</span>
                <h2 className="text-sm font-bold text-ink mt-0.5">Section Visibility</h2>
              </div>
              <div className="flex flex-col gap-2">
                {sections.map((section) => {
                  const isHidden = (data.hiddenSections ?? []).includes(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        const current = data.hiddenSections ?? [];
                        setData({
                          ...data,
                          hiddenSections: isHidden
                            ? current.filter((id) => id !== section.id)
                            : [...current, section.id],
                        });
                      }}
                      className={`flex items-center justify-between gap-3 rounded-[1rem] px-4 py-3 text-left ring-1 transition-all ${
                        isHidden ? "bg-white/50 ring-black/5 opacity-70" : "bg-white ring-black/5 hover:ring-black/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`material-symbols-outlined text-[16px] shrink-0 ${isHidden ? "text-ink-faint" : "text-accent"}`}>visibility</span>
                        <span className={`text-[13px] font-bold truncate ${isHidden ? "text-ink-soft line-through" : "text-ink"}`}>
                          {section.label}
                        </span>
                      </div>
                      <span
                        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                          isHidden ? "bg-black/15" : "bg-accent"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                            isHidden ? "left-0.5" : "left-4.5"
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-[11px] text-ink-soft leading-relaxed px-1">
                Hidden sections are removed from the published page. Your content is kept, so you can re-enable them anytime.
              </p>
            </div>
          )}
        </div>
      </>
    </aside>
  );
}
