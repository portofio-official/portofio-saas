"use client";

import { useEffect } from "react";
import shared from "./shared.module.css";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { TemplateShowcase } from "./TemplateShowcase";
import { PricingPlans } from "./PricingPlans";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";

export function LandingPage({ 
  userEmail,
}: { 
  userEmail: string | null;
}) {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(null, "", " ");
    }

    window.scrollTo(0, 0);

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(shared.isRevealed);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const revealElements = document.querySelectorAll(`.${shared.revealOnScroll}`);
    revealElements.forEach((el) => revealObserver.observe(el));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const scrollY = window.scrollY;
        const windowH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;

        if (scrollY + windowH >= docH - 150) {
          e.preventDefault();
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      const currentDeltaX = Math.abs(e.deltaX);
      const currentDeltaY = Math.abs(e.deltaY);

      if (currentDeltaX > currentDeltaY) return;

      e.preventDefault();

      if (isScrolling) return;
      if (currentDeltaY < 10) return;

      const sections = Array.from(document.querySelectorAll("main > section"));
      if (sections.length === 0) return;

      let currentIndex = 0;
      let minDistance = Infinity;
      const viewportCenter = window.innerHeight / 2;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          currentIndex = index;
        }
      });

      let nextIndex = currentIndex;
      if (e.deltaY > 0) {
        nextIndex = currentIndex + 1;
        if (nextIndex >= sections.length) {
          nextIndex = 0;
        }
      } else {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = 0;
        }
      }

      isScrolling = true;
      sections[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" });

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 1000);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className={shared.landingRoot}>
      <Navbar userEmail={userEmail} />
      <main>
        <Hero userEmail={userEmail} />
        <TemplateShowcase />
        <PricingPlans userEmail={userEmail} />
        <Testimonials />
        <FAQ />
      </main>
    </div>
  );
}
