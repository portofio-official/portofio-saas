"use client";

import { useEffect, useState } from "react";

export const LANDING_SECTION_IDS = ["home", "templates", "pricing", "testimonials", "faq"];

export function useScrollSpy(ids: string[], offset = 250) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      let current = ids[0] ?? "";

      if (scrollY + windowHeight >= documentHeight - 50) {
        current = ids[ids.length - 1];
      } else {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          const sectionTop = el.offsetTop;
          if (scrollY >= sectionTop - offset) {
            current = id;
          }
        }
      }

      setActive(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [ids, offset]);

  return active;
}