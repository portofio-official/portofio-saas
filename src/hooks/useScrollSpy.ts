"use client";

import { useEffect, useState } from "react";

export const LANDING_SECTION_IDS = ["home", "templates", "pricing", "testimonials", "faq"];

// Landing sections are tagged with data-landing-section. Template preview
// thumbnails are rendered inline in the same document (each in its own <main>)
// and reuse section ids like `pricing`, so a global getElementById() can
// resolve to the wrong element and break the spy.
function getLandingSection(id: string): HTMLElement | null {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("main > section[data-landing-section]"),
  );
  return sections.find((s) => s.id === id) ?? document.getElementById(id);
}

export function useScrollSpy(ids: string[], offset = 250) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    const compute = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      let current = ids[0] ?? "";

      if (scrollY + windowHeight >= documentHeight - 50) {
        current = ids[ids.length - 1];
      } else {
        for (const id of ids) {
          const el = getLandingSection(id);
          if (!el) continue;
          // getBoundingClientRect().top + scrollY = document-absolute section top,
          // robust to nested positioned/transformed ancestors that offsetTop misses.
          const sectionTop = el.getBoundingClientRect().top + scrollY;
          if (scrollY >= sectionTop - offset) {
            current = id;
          }
        }
      }

      setActive(current);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);

    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [ids, offset]);

  return active;
}