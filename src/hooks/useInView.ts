"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lazily signals when an element approaches the viewport.
 *
 * Defaults to `once` — the element renders once and stays rendered (so
 * already-visible content never "pops out" on scroll direction change).
 * Returns a ref to attach to the observed element and a boolean flag.
 */
export function useInView<T extends HTMLElement = HTMLElement>(options?: {
  rootMargin?: string;
  once?: boolean;
}): { ref: React.RefObject<T | null>; inView: boolean } {
  const { rootMargin = "300px 0px", once = true } = options ?? {};
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setInView(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return { ref, inView };
}
