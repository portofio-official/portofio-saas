"use client";

import { useEffect } from "react";
import shared from "./shared.module.css";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { TemplateShowcase } from "./TemplateShowcase";
import { PricingPlans } from "./PricingPlans";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";

export function LandingPage({ userEmail }: { userEmail: string | null }) {
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

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
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
