"use client";

import { type RefObject } from "react";
import { useTranslations } from "next-intl";
import { PreviewTemplateRenderer as TemplateRenderer } from "@/templates/registry";
import type { TemplateId } from "@/templates/types";
import type { EditorData, PreviewDevice, PreviewZoom } from "./types";
import { DEVICE_CONFIG } from "./types";

export interface HoveredActionCard {
  sectionType: string;
  index: number;
  rect: DOMRect;
}

export interface EditorCenterCanvasProps {
  templateId: TemplateId;
  data: EditorData;
  setData: React.Dispatch<React.SetStateAction<EditorData>>;
  expandedSection: string | null;
  setExpandedSection: (id: string | null) => void;
  previewDevice: PreviewDevice;
  setPreviewDevice: (device: PreviewDevice) => void;
  previewZoom: PreviewZoom;
  setPreviewZoom: (zoom: PreviewZoom) => void;
  pan: { x: number; y: number };
  isPanning: boolean;
  scale: number;
  computedHeight: number;
  setMobileLeftOpen: (open: boolean) => void;
  setMobileRightOpen: (open: boolean) => void;
  hoveredActionCard: HoveredActionCard | null;
  setHoveredActionCard: (card: HoveredActionCard | null) => void;
  previewScrollRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  onWheel: (e: React.WheelEvent) => void;
  onWorkspaceMouseDown: (e: React.MouseEvent) => void;
  onWorkspaceMouseMove: (e: React.MouseEvent) => void;
  onWorkspaceMouseUp: () => void;
  onPreviewMouseMove: (e: React.MouseEvent) => void;
  onPreviewMouseLeave: () => void;
  onPreviewClick: (e: React.MouseEvent) => void;
}

export function EditorCenterCanvas(props: EditorCenterCanvasProps) {
  const t = useTranslations("Editor");
  const {
    templateId,
    data,
    setData,
    expandedSection,
    setExpandedSection,
    previewDevice,
    setPreviewDevice,
    previewZoom,
    setPreviewZoom,
    pan,
    isPanning,
    scale,
    computedHeight,
    containerRef,
    setMobileLeftOpen,
    setMobileRightOpen,
    hoveredActionCard,
    setHoveredActionCard,
    previewScrollRef,
    onWheel,
    onWorkspaceMouseDown,
    onWorkspaceMouseMove,
    onWorkspaceMouseUp,
    onPreviewMouseMove,
    onPreviewMouseLeave,
    onPreviewClick,
  } = props;

  const device = DEVICE_CONFIG[previewDevice];

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-shell items-center" ref={containerRef}>
      {/* Device Toolbar */}
      <div className="flex w-full justify-between items-center px-3 sm:px-8 py-4 shrink-0 bg-white/50 backdrop-blur border-b border-black/5 z-10">
        {/* Mobile Drawer Toggles */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileLeftOpen(true)}
            className="w-8 h-8 bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center justify-center text-ink-soft hover:text-ink transition-all"
            aria-label={t("openContentPanel")}
          >
            <span className="material-symbols-outlined text-[17px]">edit_note</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileRightOpen(true)}
            className="w-8 h-8 bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center justify-center text-ink-soft hover:text-ink transition-all"
            aria-label={t("openDesignPanel")}
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-black/5 rounded-full p-1 shadow-inner">
          {(["desktop", "laptop", "tablet", "mobile"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setPreviewDevice(d)}
              className={`${
                d === "desktop" || d === "laptop" ? "hidden sm:flex" : ""
              } px-3 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all ${
                previewDevice === d
                  ? "bg-white text-ink shadow-sm ring-1 ring-black/5"
                  : "text-ink-soft hover:text-ink hover:bg-black/5"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-accent">
            <select
              value={previewZoom}
              onChange={(e) => setPreviewZoom(e.target.value as PreviewZoom)}
              className="text-[11px] font-bold text-ink bg-transparent px-3 py-1.5 outline-none cursor-pointer appearance-none"
            >
              <option value="fit-screen">{t("fitScreen")}</option>
              <option value="50">50%</option>
              <option value="100">100%</option>
            </select>
            <div className="pr-3 pointer-events-none text-ink-soft flex items-center">
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-8 h-8 bg-white rounded-full shadow-sm ring-1 ring-black/5 flex items-center justify-center text-ink-soft hover:text-ink transition-all">
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Simulation Workspace */}
      <div
        id="workspace-canvas"
        className={`flex-1 w-full relative overflow-hidden bg-shell ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        onWheel={onWheel}
        onMouseDown={onWorkspaceMouseDown}
        onMouseMove={onWorkspaceMouseMove}
        onMouseUp={onWorkspaceMouseUp}
        onMouseLeave={onWorkspaceMouseUp}
      >
        {/* Scale Wrapper */}
        <div
          className="absolute origin-center transition-transform duration-75 flex flex-col pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
            width: device.width,
            height: computedHeight,
          }}
        >
          {/* Scrollable Device Frame */}
          <div
            ref={previewScrollRef}
            onWheel={(e) => e.stopPropagation()}
            className={`flex-1 w-full bg-white relative overflow-y-auto overflow-x-hidden group/preview pointer-events-auto ${
              ["desktop", "laptop"].includes(previewDevice)
                ? ""
                : "rounded-[2rem] shadow-2xl ring-1 ring-black/5"
            }`}
            onClick={onPreviewClick}
          >
            <style>
              {`
                .group\\/preview section:hover,
                .group\\/preview header:hover,
                .group\\/preview footer:hover,
                .group\\/preview [data-section-key]:hover {
                  outline: 2px solid #3b82f6 !important;
                  outline-offset: -2px;
                  cursor: pointer;
                  position: relative;
                  z-index: 50;
                  transition: all 0.2s cubic-bezier(0.32,0.72,0,1);
                  transform: scale(1.002);
                }
                ${expandedSection ? `
                  .group\\/preview [data-section-key="${expandedSection}"],
                  .group\\/preview #${expandedSection} {
                    outline: 2px solid #3b82f6 !important;
                    outline-offset: -2px;
                    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.15) !important;
                    position: relative;
                    z-index: 40;
                    transform: scale(1.002);
                    transition: all 0.3s cubic-bezier(0.32,0.72,0,1);
                  }
                ` : ""}
              `}
            </style>
            <div
              className="w-full min-h-full transition-transform duration-300 relative"
              onMouseMove={onPreviewMouseMove}
              onMouseLeave={onPreviewMouseLeave}
            >
              <TemplateRenderer
                templateId={templateId}
                data={data as never}
              />

              {/* Quick Action Toolbar */}
              {hoveredActionCard && (
                <div
                  className="absolute z-40 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md p-1.5 shadow-xl transition-all"
                  style={{
                    top: hoveredActionCard.rect.top - 20,
                    left: hoveredActionCard.rect.left + hoveredActionCard.rect.width / 2,
                    transform: "translate(-50%, -100%)",
                  }}
                  onMouseEnter={() => {}}
                >
                  <button
                    onClick={() => setExpandedSection(hoveredActionCard.sectionType)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => {
                      const arrName = hoveredActionCard.sectionType as keyof EditorData;
                      const arr = (data as never as Record<string, unknown>)[arrName];
                      const idx = hoveredActionCard.index;
                      if (Array.isArray(arr) && idx > 0) {
                        const newArr = [...arr];
                        const temp = newArr[idx];
                        newArr[idx] = newArr[idx - 1];
                        newArr[idx - 1] = temp;
                        setData({ ...data, [arrName]: newArr });
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </button>
                  <button
                    onClick={() => {
                      const arrName = hoveredActionCard.sectionType as keyof EditorData;
                      const arr = (data as never as Record<string, unknown>)[arrName];
                      const idx = hoveredActionCard.index;
                      if (Array.isArray(arr) && idx < arr.length - 1) {
                        const newArr = [...arr];
                        const temp = newArr[idx];
                        newArr[idx] = newArr[idx + 1];
                        newArr[idx + 1] = temp;
                        setData({ ...data, [arrName]: newArr });
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </button>
                  <button
                    onClick={() => {
                      const arrName = hoveredActionCard.sectionType as keyof EditorData;
                      const arr = (data as never as Record<string, unknown>)[arrName];
                      const idx = hoveredActionCard.index;
                      if (Array.isArray(arr)) {
                        const newArr = arr.filter((_, i) => i !== idx);
                        setData({ ...data, [arrName]: newArr });
                        setHoveredActionCard(null);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-danger/80 hover:text-danger hover:bg-danger/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
