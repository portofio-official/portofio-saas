"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CaretRight, Star } from "@phosphor-icons/react";
import type { StudioData } from "@/components/templates/studio/schema";
import type { WorkspaceProfile } from "@/lib/templates/definition";

const BORDER_OUTER = "rgba(255, 255, 255, 0.1)";
const BORDER_INNER = "rgba(255, 255, 255, 0.05)";

// ── Components ─────────────────────────────────────────────────────────────

function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[2rem] p-1.5 ${className}`}
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        boxShadow: `inset 0 0 0 1px ${BORDER_OUTER}`,
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[calc(2rem-0.375rem)]"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.15), inset 0 0 0 1px ${BORDER_INNER}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MagneticButton({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) {
  const content = (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      className="group relative flex items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-black"
    >
      <span>{children}</span>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-1 group-hover:scale-105">
        <CaretRight weight="bold" />
      </div>
    </motion.button>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

function HeroSection({ hero, profile }: { hero: StudioData["hero"]; profile: StudioData["profile"] }) {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-24 text-center">
      {/* Subtle radial mesh gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-30">
        <div className="h-[600px] w-[600px] rounded-full bg-white/5 blur-[100px]" />
      </div>
      
      <div className="relative z-10 flex max-w-4xl flex-col items-center">
        <Reveal>
          <div className="mb-8 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60" style={{ boxShadow: `inset 0 0 0 1px ${BORDER_OUTER}` }}>
            {profile.fullName || "Studio"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mb-6 max-w-3xl text-balance text-5xl font-medium tracking-tight text-white md:text-7xl lg:text-8xl">
            {hero.headline}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mb-12 max-w-[40ch] text-balance text-lg leading-relaxed text-zinc-400 md:text-xl">
            {hero.subheadline || profile.headline}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <MagneticButton href="#work">{hero.ctaLabel}</MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

function ExpertiseSection({ expertise }: { expertise: StudioData["expertise"] }) {
  if (!expertise.length) return null;
  return (
    <section className="px-4 py-24 md:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="mb-16 text-3xl font-medium tracking-tight text-white md:text-5xl">Capabilities</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {expertise.map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <DoubleBezelCard className="h-full">
                <div className="flex h-full flex-col p-8 md:p-10">
                  <h3 className="mb-4 text-xl font-medium text-white">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </DoubleBezelCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ projects }: { projects: StudioData["projects"] }) {
  if (!projects.length) return null;
  return (
    <section id="work" className="px-4 py-24 md:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="mb-16 text-3xl font-medium tracking-tight text-white md:text-5xl">Selected Work</h2>
        </Reveal>
        
        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {projects.map((p, i) => {
            // Pattern: 1st full width, 2nd & 3rd split, 4th full width, etc.
            const isFullWidth = i % 3 === 0;
            const spanClass = isFullWidth ? "md:col-span-12" : "md:col-span-6";
            
            return (
              <div key={i} className={`group ${spanClass}`}>
                <Reveal delay={i % 3 === 0 ? 0 : 0.1}>
                  <DoubleBezelCard className="h-[400px] md:h-[500px]">
                    <a
                      href={p.link || "#"}
                      target={p.link ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="block h-full w-full"
                    >
                      {p.imageUrl ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                          style={{ backgroundImage: `url(${p.imageUrl})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-900/50" />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                      
                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-8 md:p-10">
                        <div>
                          <h3 className="mb-2 text-2xl font-medium text-white md:text-3xl">{p.title}</h3>
                          <p className="max-w-md text-zinc-300 line-clamp-2">{p.description}</p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:bg-white group-hover:text-black">
                          <ArrowUpRight weight="bold" />
                        </div>
                      </div>
                    </a>
                  </DoubleBezelCard>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials }: { testimonials: StudioData["testimonials"] }) {
  if (!testimonials.length) return null;
  return (
    <section className="px-4 py-24 md:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-16 flex items-center gap-4">
            <Star weight="fill" className="text-white/40" />
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">Client Perspectives</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <DoubleBezelCard>
                <div className="flex flex-col justify-between p-8 md:p-12 h-full">
                  <p className="mb-12 text-xl leading-relaxed text-zinc-300 md:text-2xl">&quot;{t.quote}&quot;</p>
                  <div>
                    <div className="text-base font-medium text-white">{t.name}</div>
                    <div className="text-sm text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </DoubleBezelCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ contact }: { contact: StudioData["contact"] }) {
  return (
    <section className="px-4 py-24 pb-40 md:py-40">
      <div className="mx-auto max-w-7xl text-center">
        <Reveal>
          <h2 className="mb-8 text-4xl font-medium tracking-tight text-white md:text-6xl lg:text-7xl">
            Let&apos;s build something <br className="hidden md:block" /> remarkable.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex justify-center">
            {contact.email ? (
              <MagneticButton href={`mailto:${contact.email}`}>
                Get in touch
              </MagneticButton>
            ) : (
              <MagneticButton>
                Get in touch
              </MagneticButton>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Main Template ──────────────────────────────────────────────────────────

export function StudioTemplate({
  data,
}: {
  data: StudioData;
  workspaceProfile: WorkspaceProfile;
}) {
  return (
    <div 
      className="min-h-screen bg-[#050505] text-zinc-400 selection:bg-white/20 selection:text-white"
      style={{ fontFamily: "var(--font-sans), sans-serif" }}
    >
      {/* Noise overlay for texture */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      <main className="relative z-10">
        <HeroSection hero={data.hero} profile={data.profile} />
        <ProjectsSection projects={data.projects} />
        <ExpertiseSection expertise={data.expertise} />
        <TestimonialsSection testimonials={data.testimonials} />
        <ContactSection contact={data.contact} />
      </main>
    </div>
  );
}
