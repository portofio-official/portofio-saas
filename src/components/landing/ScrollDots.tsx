"use client";

import { useTranslations } from "next-intl";
import styles from "./ScrollDots.module.css";
import { LANDING_SECTION_IDS, useScrollSpy } from "@/hooks/useScrollSpy";

export function ScrollDots() {
  const tNav = useTranslations("Landing.Navbar");
  const tTesti = useTranslations("Landing.Testimonials");
  const activeSection = useScrollSpy(LANDING_SECTION_IDS);

  const labels: Record<string, string> = {
    home: tNav("home"),
    templates: tNav("templates"),
    pricing: tNav("pricing"),
    testimonials: tTesti("heading"),
    faq: tNav("faq"),
  };

  const handleSelect = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className={styles.rail} aria-label="Section navigation">
      {LANDING_SECTION_IDS.map((id) => (
        <button
          key={id}
          type="button"
          className={`${styles.dot} ${activeSection === id ? styles.active : ""}`}
          onClick={() => handleSelect(id)}
          aria-label={labels[id]}
          aria-current={activeSection === id ? "true" : undefined}
        >
          <span className={styles.tooltip}>{labels[id]}</span>
        </button>
      ))}
    </nav>
  );
}