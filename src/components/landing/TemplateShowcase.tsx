"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import shared from "./shared.module.css";
import styles from "./TemplateShowcase.module.css";

type TemplateBase = { id: number; image: string; isPremium: boolean };

const templateBases: TemplateBase[] = [
  { id: 1, image: "/basic_template_1.png", isPremium: false },
  { id: 2, image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: false },
  { id: 3, image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: false },
  { id: 4, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: false },
  { id: 5, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: false },
  { id: 6, image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: true },
  { id: 7, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: true },
  { id: 8, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: true },
  { id: 9, image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: true },
  { id: 10, image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", isPremium: true },
];

type TemplateCopy = { category: string; name: string };

export function TemplateShowcase() {
  const t = useTranslations("Landing.TemplateShowcase");
  const items = t.raw("items") as TemplateCopy[];
  const allTemplates = templateBases.map((base, i) => ({ ...base, ...items[i] }));

  const categories = [
    { key: "basic", label: t("basic") },
    { key: "premium", label: t("premium") },
  ] as const;
  const [activeTab, setActiveTab] = useState<"basic" | "premium">("basic");
  const [currentIndex, setCurrentIndex] = useState(2);

  const deltaHistory = useRef([0, 0, 0, 0, 0]);
  const lastWheelTime = useRef(0);
  const swipeLock = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const displayTemplates = allTemplates.filter((t) => (activeTab === "premium" ? t.isPremium : !t.isPremium));

  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab);
    setCurrentIndex(2);
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === displayTemplates.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayTemplates.length - 1 : prev - 1));
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleNativeWheel = (e: WheelEvent) => {
      const currentDeltaX = Math.abs(e.deltaX);
      const currentDeltaY = Math.abs(e.deltaY);

      if (currentDeltaX > currentDeltaY) {
        e.preventDefault();

        const now = Date.now();
        if (now - lastWheelTime.current > 200) {
          deltaHistory.current = [0, 0, 0, 0, 0];
        }
        lastWheelTime.current = now;

        const prevAverage =
          (deltaHistory.current[0] + deltaHistory.current[1] + deltaHistory.current[2] + deltaHistory.current[3]) / 4;

        deltaHistory.current.shift();
        deltaHistory.current.push(currentDeltaX);

        if (currentDeltaX > 20 && currentDeltaX > prevAverage * 1.5) {
          if (!swipeLock.current) {
            swipeLock.current = true;

            if (e.deltaX > 0) {
              setCurrentIndex((prev) => (prev === 4 ? 0 : prev + 1));
            } else {
              setCurrentIndex((prev) => (prev === 0 ? 4 : prev - 1));
            }

            setTimeout(() => {
              swipeLock.current = false;
            }, 400);
          }
        }
      } else {
        lastWheelTime.current = 0;
      }
    };

    wrapper.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    let offset = index - currentIndex;
    const total = displayTemplates.length;

    if (offset < -2) offset += total;
    if (offset > 2) offset -= total;

    let translateX = 0;
    let scale = 1;
    let zIndex = 5;
    let opacity = 1;
    let rotateY = 0;

    if (offset === 0) {
      translateX = 0;
      scale = 1;
      zIndex = 10;
      opacity = 1;
      rotateY = 0;
    } else if (offset === 1) {
      translateX = 55;
      scale = 0.8;
      zIndex = 8;
      opacity = 0.8;
      rotateY = -15;
    } else if (offset === -1) {
      translateX = -55;
      scale = 0.8;
      zIndex = 8;
      opacity = 0.8;
      rotateY = 15;
    } else if (offset === 2) {
      translateX = 100;
      scale = 0.6;
      zIndex = 6;
      opacity = 0.5;
      rotateY = -25;
    } else if (offset === -2) {
      translateX = -100;
      scale = 0.6;
      zIndex = 6;
      opacity = 0.5;
      rotateY = 25;
    }

    return {
      transform: `translateX(${translateX}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
      zIndex,
      opacity,
    };
  };

  return (
    <section className={styles.templateShowcase} id="templates">
      <svg
        viewBox="0 0 1600 800"
        className={styles.abstractSquiggle}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="squiggleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDB4D2" />
            <stop offset="16%" stopColor="#FDB4D2" />
            <stop offset="16%" stopColor="#FF7214" />
            <stop offset="33%" stopColor="#FF7214" />
            <stop offset="33%" stopColor="#D2F614" />
            <stop offset="50%" stopColor="#D2F614" />
            <stop offset="50%" stopColor="#005A3D" />
            <stop offset="66%" stopColor="#005A3D" />
            <stop offset="66%" stopColor="#0E6DFD" />
            <stop offset="83%" stopColor="#0E6DFD" />
            <stop offset="83%" stopColor="#80C9FF" />
            <stop offset="100%" stopColor="#80C9FF" />
          </linearGradient>
        </defs>
        <path
          d="M -100 400 C 200 150, 400 650, 800 400 C 1200 150, 1400 650, 1700 400"
          fill="none"
          stroke="url(#squiggleGrad)"
          strokeWidth="60"
          strokeLinecap="round"
        />
      </svg>

      <div className={`${shared.container} ${shared.revealOnScroll}`}>
        <div className={styles.showcaseHeader}>
          <h2>{t("heading")}</h2>
          <p>{t("subheading")}</p>
        </div>

        <div className={styles.templateTabs}>
          {categories.map((cat) => {
            const isPremium = cat.key === "premium";
            return (
              <button
                key={cat.key}
                className={`${styles.pillBtn} ${activeTab === cat.key ? styles.active : ""} ${isPremium ? styles.premiumPill : ""}`}
                onClick={() => setActiveTab(cat.key)}
              >
                {cat.label}
              </button>
            );
          })}
          <Link href="/templates" className={`${styles.pillBtn} ${styles.viewMore}`}>{t("viewMore")}</Link>
        </div>

        <div className={styles.coverflowContainer}>
          <div
            className={styles.coverflowWrapper}
            ref={wrapperRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayTemplates.map((template, index) => {
              const isCenter = index === currentIndex;

              return (
                <div
                  key={template.id}
                  className={`${styles.coverflowCard} ${isCenter ? styles.active : ""}`}
                  style={getCardStyle(index)}
                  onClick={() => !isCenter && setCurrentIndex(index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={template.image} alt={template.name} className={styles.coverflowImage} />

                  {template.isPremium && (
                    <div className={styles.premiumBadge}>
                      <svg viewBox="0 0 24 24" fill="#FCA311" width="22px" height="22px">
                        <path d="M2.5 6.5l5.5 5.5 4-7.5 4 7.5 5.5-5.5-2 10.5h-15z" strokeLinejoin="round" />
                        <rect x="3" y="19" width="18" height="2.5" rx="1" />
                      </svg>
                    </div>
                  )}

                  {isCenter && (
                    <div className={styles.cardPlayBtn}>
                      <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                  )}

                  <div className={styles.cardInfo}>
                    <span className={styles.cardCategory}>{template.category}</span>
                    <h3 className={styles.cardName}>{template.name}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.coverflowControls}>
            <button className={styles.navArrow} onClick={prevSlide}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className={styles.navArrow} onClick={nextSlide}>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
