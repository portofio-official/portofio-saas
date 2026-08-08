"use client";

import { useEffect } from "react";
import shared from "./shared.module.css";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { ScrollDots } from "./ScrollDots";
import { TemplateShowcase } from "./TemplateShowcase";
import { PricingPlans } from "./PricingPlans";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";

export function LandingPage({ 
  userEmail,
  userRole,
}: { 
  userEmail: string | null;
  userRole: string;
}) {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(null, "", " ");
    }

    window.scrollTo(0, 0);

    // Scope native smooth + scroll-snap to the landing page only (the class is
    // removed on unmount so other routes keep their default scroll behavior).
    document.documentElement.classList.add("landing-scroll");

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

    return () => {
      revealObserver.disconnect();
      document.documentElement.classList.remove("landing-scroll");
    };
  }, []);

  return (
    <div className={shared.landingRoot}>
      <Navbar userEmail={userEmail} userRole={userRole} />
      <ScrollDots />
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
