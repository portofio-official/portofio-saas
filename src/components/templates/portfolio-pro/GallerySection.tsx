"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Play, Pause } from "lucide-react";
import type { PortfolioProData } from "./schema";
import type { ColorScheme } from "./theme";

type GalleryItem = PortfolioProData["gallery"][number];

export function GallerySection({ items, theme, isMobileView }: { items: GalleryItem[]; theme: ColorScheme; isMobileView: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  useEffect(() => {
    if (isPaused || items.length < 2) return;
    const interval = setInterval(() => setActiveIdx((prev) => (prev + 1) % items.length), 5000);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  if (!items.length) return null;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
    isSwiping.current = false;
  }
  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.targetTouches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 10) isSwiping.current = true;
  }
  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setActiveIdx((prev) => (diff > 0 ? (prev + 1) % items.length : (prev - 1 + items.length) % items.length));
    }
  }

  const queueLimit = isMobileView ? 4 : 8;
  const queue = Array.from({ length: Math.min(queueLimit, items.length - 1) }, (_, i) => {
    const idx = (activeIdx + i + 1) % items.length;
    return { item: items[idx], idx };
  });
  const current = items[activeIdx];

  return (
    <section
      id="activities"
      onClick={() => !isSwiping.current && setIsPaused((p) => !p)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex h-[685px] w-full scroll-mt-[72px] cursor-pointer flex-col justify-end overflow-hidden bg-[#111] pt-0 pb-0 text-white sm:h-[725px] lg:h-[766px] lg:pt-16 lg:pb-0"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {items.map((it, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={idx}
            src={it.imageUrl}
            alt={it.title ?? ""}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-in-out ${idx === activeIdx ? "scale-105 opacity-100" : "pointer-events-none scale-100 opacity-0"}`}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="relative z-20 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pt-20 pb-8 sm:px-8 lg:mt-auto lg:flex lg:flex-col lg:items-stretch lg:justify-end lg:gap-6 lg:py-0">
        <div className="relative z-10 flex flex-col items-start gap-4 text-left lg:w-full">
          <div key={`meta-${activeIdx}`} className="animate-fade-in-up-custom flex items-center gap-3 text-[11px] font-black tracking-wider text-gray-200 uppercase sm:text-xs">
            {current.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} /> {current.location}
              </span>
            )}
            {current.date && (
              <>
                <span className="opacity-40">•</span>
                <span>{current.date}</span>
              </>
            )}
            <span className="opacity-40">•</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused((p) => !p);
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-sm transition-all hover:bg-white/20"
            >
              {isPaused ? <Play size={9} className="fill-white" /> : <Pause size={9} className="fill-white" />}
            </button>
          </div>
          {current.title && (
            <h2 key={`title-${activeIdx}`} className="animate-fade-in-up-custom text-2xl leading-[1.1] font-bold tracking-tight text-white drop-shadow-md sm:text-4xl">
              {current.title}
            </h2>
          )}
          {current.description && (
            <p key={`desc-${activeIdx}`} className="animate-fade-in-up-custom mt-1.5 max-w-md text-[11px] leading-relaxed text-gray-300/90 drop-shadow-sm sm:text-xs lg:max-w-[600px] lg:text-sm">
              {current.description}
            </p>
          )}
        </div>

        <div className="relative z-10 -mt-2 flex w-full justify-start overflow-x-auto pt-2 pb-4 lg:w-full lg:mb-0">
          <div className="flex gap-4 sm:gap-6 lg:gap-4">
            {queue.map(({ item, idx }) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                className="group relative h-[100px] w-[150px] shrink-0 cursor-pointer overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 sm:h-[150px] sm:w-[240px] lg:h-[106px] lg:w-[170px] lg:rounded-[1rem]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title ?? ""} className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                {item.title && (
                  <div className="pointer-events-none absolute bottom-0 left-0 w-full p-4 text-left sm:p-5 lg:p-3.5">
                    <h4 className="line-clamp-2 text-xs leading-snug font-extrabold text-white drop-shadow-sm sm:text-sm lg:text-[11px]">{item.title}</h4>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div
          key={`progress-${activeIdx}-${isPaused}`}
          className={`animate-autoplay-progress absolute bottom-[-1px] left-0 z-30 h-[3px] w-full ${isPaused ? "paused" : ""}`}
          style={{ backgroundColor: theme.accent }}
        />
      )}
    </section>
  );
}
