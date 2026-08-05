"use client";

import { useEffect, useRef } from "react";
import { initials, SocialIcon } from "@/templates/shared";
import { freelancerDefinition } from "./definition";
import type { FreelancerData } from "./schema";
import type { WorkspaceProfile } from "@/templates/definition";

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG = "#FAFAF8";
const INK = "#111110";
const MUTED = "#6B6B63";
const FAINT = "#B0AFA7";
const LINE = "#E4E3DC";
const CARD = "#FFFFFF";
const SURFACE = "#F2F1EB";

// ─── Price display helper ─────────────────────────────────────────────────────
function formatPrice(price: number, currency: string, period: string): string {
  if (price === 0) return "Custom";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
  }).format(price);
  if (period === "monthly") return `${formatted}/mo`;
  if (period === "yearly") return `${formatted}/yr`;
  return formatted; // one-time
}

// ─────────────────────────────────────────────────────────────────────────────
export function FreelancerRenderer({
  data,
}: {
  data: FreelancerData;
  workspaceProfile?: WorkspaceProfile;
}) {
  const {
    profile,
    tagline,
    skills,
    projects,
    testimonials,
    pricing,
    contact,
    socials,
    theme,
    availableForWork,
  } = data;
  
  const variant = freelancerDefinition.variants.find((v) => v.id === theme.variantId) || freelancerDefinition.variants[0];

  // Reveal animation
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("translate-y-0", "opacity-100");
            entry.target.classList.remove("translate-y-8", "opacity-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const accent = variant.colors.primary;

  return (
    <div
      className={`min-h-screen`}
      style={{ backgroundColor: BG, color: INK }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-40 border-b flex items-center justify-between px-6 md:px-12 h-16"
        style={{ backgroundColor: BG, borderColor: LINE }}
      >
        <span className="text-sm font-semibold tracking-tight">
          {profile.fullName || "Portfolio"}
        </span>
        <div className="flex items-center gap-6">
          {availableForWork && (
            <span
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: accent }}
              />
              Available for work
            </span>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="text-xs font-semibold px-4 py-2 rounded-full border transition-colors hover:opacity-80"
              style={{
                color: accent,
                borderColor: accent,
              }}
            >
              Hire me
            </a>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-[960px] px-6 md:px-12">
        {/* ── HERO ── */}
        <header
          id="profile"
          ref={setReveal}
          className="py-20 md:py-28 opacity-0 translate-y-8 transform transition-all duration-700"
        >
          {/* Avatar */}
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoUrl}
              alt={profile.fullName || "Profile"}
              className="mb-8 h-16 w-16 rounded-full object-cover border-2"
              style={{ borderColor: accent }}
            />
          ) : (
            <div
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold border-2"
              style={{
                backgroundColor: `${accent}15`,
                color: accent,
                borderColor: accent,
              }}
            >
              {initials(profile.fullName)}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            {profile.fullName || "Your Name"}
          </h1>
          <p
            className="text-xl md:text-2xl font-medium mb-6"
            style={{ color: MUTED }}
          >
            {profile.headline || "Freelancer & Creator"}
          </p>

          {tagline && (
            <p className="text-base mb-8" style={{ color: MUTED }}>
              {tagline}
            </p>
          )}

          {profile.bio && (
            <p
              className="text-lg leading-relaxed max-w-xl"
              style={{ color: MUTED }}
            >
              {profile.bio}
            </p>
          )}

          {/* Skills strip */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 text-xs font-mono tracking-wide rounded-full border"
                  style={{ borderColor: LINE, color: MUTED, backgroundColor: SURFACE }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* ── PROJECTS ── */}
        {projects.length > 0 && (
          <section
            id="projects"
            ref={setReveal}
            className="py-16 border-t opacity-0 translate-y-8 transform transition-all duration-700 delay-100"
            style={{ borderColor: LINE }}
          >
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-10"
              style={{ color: FAINT }}
            >
              Selected Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, i) => (
                <a
                  key={i}
                  href={project.link || undefined}
                  className="group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg"
                  style={{ borderColor: LINE, backgroundColor: CARD }}
                >
                  <div
                    className="aspect-[16/9] w-full overflow-hidden"
                    style={{ backgroundColor: SURFACE }}
                  >
                    {project.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-3xl font-light"
                        style={{ color: FAINT }}
                      >
                        {project.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{project.title}</h3>
                      <span
                        className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color: accent }}
                      >
                        ↗
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                      {project.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS ── */}
        {testimonials.length > 0 && (
          <section
            id="testimonials"
            ref={setReveal}
            className="py-16 border-t opacity-0 translate-y-8 transform transition-all duration-700 delay-150"
            style={{ borderColor: LINE }}
          >
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-10"
              style={{ color: FAINT }}
            >
              What Clients Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-2xl border p-6"
                  style={{ borderColor: LINE, backgroundColor: CARD }}
                >
                  <p
                    className="text-sm leading-relaxed mb-6 italic"
                    style={{ color: MUTED }}
                  >
                    &ldquo;{t.quote ?? t.body ?? ""}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0"
                      style={{
                        backgroundColor: `${accent}15`,
                        color: accent,
                      }}
                    >
                      {initials(t.name)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{t.name}</p>
                      {t.role && (
                        <p className="text-xs" style={{ color: FAINT }}>
                          {t.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PRICING ── */}
        {pricing.length > 0 && (
          <section
            id="pricing"
            ref={setReveal}
            className="py-16 border-t opacity-0 translate-y-8 transform transition-all duration-700 delay-200"
            style={{ borderColor: LINE }}
          >
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: FAINT }}
            >
              Pricing
            </h2>
            <p className="text-lg font-medium mb-10">
              Transparent rates. No surprises.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pricing.map((tier, i) => (
                <div
                  key={i}
                  className="relative flex flex-col rounded-2xl border p-6"
                  style={{
                    borderColor: tier.highlighted ? accent : LINE,
                    backgroundColor: tier.highlighted
                      ? `${accent}08`
                      : CARD,
                    boxShadow: tier.highlighted
                      ? `0 0 0 1.5px ${accent}`
                      : undefined,
                  }}
                >
                  {tier.highlighted && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: accent }}
                    >
                      Popular
                    </span>
                  )}
                  <p className="text-sm font-semibold mb-2" style={{ color: MUTED }}>
                    {tier.name}
                  </p>
                  <p
                    className="text-3xl font-bold tracking-tight mb-5"
                    style={{ color: tier.highlighted ? accent : INK }}
                  >
                    {formatPrice(tier.price, tier.currency ?? "USD", tier.period ?? "one-time")}
                  </p>
                  <ul className="flex flex-col gap-2 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                        <span style={{ color: accent }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}?subject=Inquiry: ${tier.name} plan`}
                      className="w-full text-center text-xs font-semibold py-2.5 rounded-xl border transition-all hover:opacity-80"
                      style={
                        tier.highlighted
                          ? { backgroundColor: accent, color: "#fff", borderColor: accent }
                          : { borderColor: LINE, color: INK }
                      }
                    >
                      Get Started
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CONTACT ── */}
        <footer
          id="contact"
          ref={setReveal}
          className="py-16 border-t flex flex-col md:flex-row items-start justify-between gap-8 opacity-0 translate-y-8 transform transition-all duration-700 delay-300"
          style={{ borderColor: LINE }}
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Let&apos;s work together
            </h2>
            <p className="text-base mb-6" style={{ color: MUTED }}>
              {profile.location && `Based ${profile.location} · `}
              Ready for the next challenge.
            </p>
            <div className="flex flex-col gap-2">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-base font-medium underline decoration-dotted underline-offset-4"
                  style={{ color: accent }}
                >
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <span className="text-sm font-mono" style={{ color: MUTED }}>
                  {contact.phone}
                </span>
              )}
            </div>
          </div>

          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  aria-label={social.platform}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110"
                  style={{ borderColor: LINE, backgroundColor: SURFACE, color: MUTED }}
                >
                  <SocialIcon platform={social.platform} size={18} />
                </a>
              ))}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
