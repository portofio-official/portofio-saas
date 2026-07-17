"use client";
/* eslint-disable react-hooks/refs -- see ResumeSection.tsx for why this is safe here. */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Lock, LockOpen, ZoomIn, ZoomOut } from "lucide-react";
import type { PortfolioProData } from "./schema";
import { TAG_COLORS, type ColorScheme } from "./theme";
import { useDragScroll } from "./useDragScroll";
import { MediaCard } from "./MediaCard";

type CaseStudy = PortfolioProData["caseStudies"][number];

function Lightbox({ images, index, setIndex, onClose }: { images: string[]; index: number; setIndex: (i: number) => void; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);

  function goTo(i: number) {
    setIndex(i);
    setZoom(1);
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-[120] flex select-none flex-col items-center justify-center bg-black/75 p-4 backdrop-blur-xl">
      <button type="button" onClick={onClose} title="Close" className="absolute top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/15">
        <X size={20} />
      </button>
      <div onClick={(e) => e.stopPropagation()} className="absolute right-6 bottom-6 z-30 flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-black/55 p-1.5 shadow-2xl backdrop-blur-md">
        <button type="button" onClick={() => setZoom((z) => Math.min(4, z + 0.5))} title="Zoom in" className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all hover:bg-white/15 active:scale-95">
          <ZoomIn size={16} />
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} title="Zoom out" className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all hover:bg-white/15 active:scale-95">
          <ZoomOut size={16} />
        </button>
      </div>
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goTo((index - 1 + images.length) % images.length);
          }}
          className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/25 active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goTo((index + 1) % images.length);
          }}
          className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/25 active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      )}
      <div className="flex h-full w-full items-center justify-center overflow-hidden p-8" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt="Zoomed view"
          draggable={false}
          onClick={() => setZoom((z) => (z === 1 ? 2.5 : 1))}
          style={{ transform: `scale(${zoom})`, transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)", maxHeight: "85vh", maxWidth: "85vw", objectFit: "contain", cursor: zoom === 1 ? "zoom-in" : "zoom-out" }}
        />
      </div>
    </div>
  );
}

function ProjectDetailModal({ project, isDark, theme, isMobileView, onClose }: { project: CaseStudy; isDark: boolean; theme: ColorScheme; isMobileView: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "impact">("overview");
  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const tabs = [
    { id: "overview" as const, label: "Overview", show: Boolean(project.description) },
    { id: "impact" as const, label: "Impact", show: project.achievements.length > 0 },
  ].filter((t) => t.show);

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative flex w-full flex-col overflow-hidden rounded-3xl shadow-2xl ${isMobileView ? "max-h-[85vh] max-w-[340px]" : "max-h-[85vh] max-w-2xl"} ${isDark ? `${theme.darkBg} border border-white/10` : "border border-slate-200 bg-slate-50"}`}
        >
          <div className={`flex shrink-0 items-center justify-between border-b p-6 sm:p-8 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>Project Detail</h3>
            <button type="button" onClick={onClose} className={`rounded-full p-2 transition-colors ${isDark ? "text-gray-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-200"}`}>
              <X size={24} />
            </button>
          </div>
          <div className="hide-scrollbar flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:gap-5">
              {project.images.length > 0 && (
                <div
                  onClick={() => setLightboxOpen(true)}
                  className="group relative flex min-h-[120px] w-full max-h-[320px] cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-black/5 shadow-sm sm:max-h-[420px] dark:border-white/10 dark:bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.images[imgIdx]} alt={project.title} className="mx-auto h-auto max-h-[320px] w-auto max-w-full object-scale-down sm:max-h-[420px]" />
                  {project.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgIdx((imgIdx - 1 + project.images.length) % project.images.length);
                        }}
                        className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/75"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgIdx((imgIdx + 1) % project.images.length);
                        }}
                        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/75"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {project.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              setImgIdx(i);
                            }}
                            className={`h-2 w-2 rounded-full transition-all ${i === imgIdx ? "scale-125 bg-white" : "bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  {project.category && <span className="text-xs font-bold tracking-wider uppercase" style={{ color: theme.accent }}>{project.category}</span>}
                  {project.confidential ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold tracking-wider uppercase ${isDark ? "border-rose-500/20 bg-rose-500/10 text-rose-400" : "border-rose-200/60 bg-rose-50 text-rose-600 shadow-sm"}`}>
                      <Lock size={10} strokeWidth={2.5} /> Limited Access
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold tracking-wider uppercase ${isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-emerald-200/60 bg-emerald-50 text-emerald-600 shadow-sm"}`}>
                      <LockOpen size={10} strokeWidth={2.5} /> Full Access
                    </span>
                  )}
                </div>
                <h3 className={`text-xl leading-tight font-bold whitespace-pre-line ${isMobileView ? "" : "sm:text-2xl"} ${isDark ? "text-white" : "text-slate-900"}`}>{project.title}</h3>
              </div>

              <div className={`my-1 h-px w-full ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

              {tabs.length > 0 && (
                <div className="flex flex-col text-left">
                  <div className={`mb-5 flex gap-4 border-b sm:gap-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`relative pb-3 text-sm font-semibold sm:text-base ${tab === t.id ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-gray-500 hover:text-gray-300" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        {t.label}
                        {tab === t.id && <div className="absolute right-0 bottom-[-1px] left-0 h-[2px] rounded-t-full" style={{ backgroundColor: theme.accent }} />}
                      </button>
                    ))}
                  </div>
                  {tab === "overview" && project.description && (
                    <p className={`leading-relaxed whitespace-pre-line ${isMobileView ? "text-sm" : "text-base"} ${isDark ? "text-gray-300" : "text-slate-600"}`}>{project.description}</p>
                  )}
                  {tab === "impact" && (
                    <ul className={`list-outside list-disc space-y-2.5 pl-5 ${isMobileView ? "text-sm" : "text-base"} ${isDark ? "text-gray-300 marker:text-gray-500" : "text-slate-600 marker:text-slate-400"}`}>
                      {project.achievements.map((a, i) => <li key={i} className="pl-1.5 leading-relaxed">{a}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {project.tech.length > 0 && (
                <div className="mt-2">
                  <h5 className={`mb-3 text-left text-sm font-bold ${isDark ? "text-gray-300" : "text-slate-500"}`}>
                    {project.link ? "Tools Used (click to view project)" : "Tools Used"}
                  </h5>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {project.tech.map((t, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold shadow-sm sm:text-xs"
                        style={{ backgroundColor: `${TAG_COLORS[i % TAG_COLORS.length]}15`, borderColor: `${TAG_COLORS[i % TAG_COLORS.length]}30`, color: TAG_COLORS[i % TAG_COLORS.length] }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-max items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  View project
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {lightboxOpen && <Lightbox images={project.images} index={imgIdx} setIndex={setImgIdx} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

export function ProjectsSection({ items, isDark, theme, isMobileView }: { items: CaseStudy[]; isDark: boolean; theme: ColorScheme; isMobileView: boolean }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState<CaseStudy | null>(null);
  const [showAll, setShowAll] = useState(false);
  const drag = useDragScroll();

  useEffect(() => {
    document.body.style.overflow = selected || showAll ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, showAll]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else if (showAll) setShowAll(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, showAll]);

  if (!items.length) return null;

  const techs = ["All", ...Array.from(new Set(items.flatMap((p) => p.tech)))];
  const filtered = activeFilter === "All" ? items : items.filter((p) => p.tech.includes(activeFilter));

  return (
    <section id="projects" className="w-full scroll-mt-[45px] py-12 lg:scroll-mt-[72px] lg:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6">
        <div className={`mb-6 flex w-full flex-col gap-2 lg:mb-8 ${isMobileView ? "items-center text-center" : "text-left"}`}>
          <h2 className={`leading-tight font-bold tracking-tight ${isMobileView ? "text-3xl" : "text-4xl lg:text-5xl"} ${isDark ? "text-white" : "text-slate-900"}`}>
            Featured <span style={{ color: theme.accent }}>Projects</span>
          </h2>
          <p className={`leading-relaxed ${isMobileView ? "max-w-2xl text-sm" : "text-base"} ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            A collection of projects that shaped my professional experience and skills.
          </p>
        </div>

        <div className={`hide-scrollbar mb-2 flex gap-4 overflow-x-auto border-b sm:gap-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          {techs.map((tech) => {
            const isActive = activeFilter === tech;
            return (
              <button
                key={tech}
                type="button"
                onClick={() => setActiveFilter(tech)}
                className={`relative shrink-0 pb-3 text-sm whitespace-nowrap sm:text-base ${isActive ? "font-bold" : `font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}`}
                style={isActive ? { color: theme.accent } : undefined}
              >
                {tech}
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
          className="hide-scrollbar -mx-2 flex cursor-grab gap-4 overflow-x-auto px-2 pt-4 pb-6 select-none active:cursor-grabbing sm:gap-6"
        >
          {filtered.length ? (
            filtered.map((project, i) => (
              <MediaCard
                key={i}
                pillLabel={project.category}
                date={project.date}
                title={project.title}
                titleClassName="whitespace-pre-line"
                description={project.description}
                imageUrl={project.images[0]}
                isDark={isDark}
                isGrid={false}
                onClick={() => {
                  if (!drag.wasDragged()) setSelected(project);
                }}
              />
            ))
          ) : (
            <div className={`w-full rounded-lg border-2 border-dashed p-8 text-center ${isDark ? "border-white/20 text-gray-400" : "border-slate-300 text-slate-500"}`}>
              No projects with this filter yet.
            </div>
          )}
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
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>All Projects {activeFilter !== "All" ? `- ${activeFilter}` : ""}</h3>
                <button type="button" onClick={() => setShowAll(false)} className={`rounded-full p-2 transition-colors ${isDark ? "text-gray-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-200"}`}>
                  <X size={24} />
                </button>
              </div>
              <div className="hide-scrollbar flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((project, i) => (
                    <MediaCard
                      key={i}
                      pillLabel={project.category}
                      date={project.date}
                      title={project.title}
                      titleClassName="whitespace-pre-line"
                      description={project.description}
                      imageUrl={project.images[0]}
                      isDark={isDark}
                      isGrid
                      onClick={() => setSelected(project)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {selected &&
        typeof document !== "undefined" &&
        createPortal(<ProjectDetailModal project={selected} isDark={isDark} theme={theme} isMobileView={isMobileView} onClose={() => setSelected(null)} />, document.body)}
    </section>
  );
}
