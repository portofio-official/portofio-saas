"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import { SocialIcon } from "@/templates/shared";
import { TEMPLATE_FONT_VARIABLES } from "@/templates/fonts";
import type { StudioData } from "./schema";
import type { WorkspaceProfile } from "@/templates/definition";
import { studioDefinition } from "./definition";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StudioRenderer({ data }: { data: StudioData; workspaceProfile?: WorkspaceProfile }) {
  const hidden = (id: string) => data.hiddenSections?.includes(id) ?? false;
  const variant = studioDefinition.variants.find((item) => item.id === data.theme.variantId) || studioDefinition.variants[0];
  const { primary: accent, background, surface, text, textMuted, border } = variant.colors;
  const whatsappDigits = data.contact.whatsapp?.replace(/\D/g, "");
  const year = new Date().getFullYear();
  const projectCount = String(data.projects.length).padStart(2, "0");
  const sectionLabel = (index: string, label: string) => (
    <div className="mb-12 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: textMuted }}>
      <span style={{ color: accent }}>{index}</span><span className="h-px w-10" style={{ backgroundColor: border }} /><span>{label}</span>
    </div>
  );

  return (
    <div className={`${TEMPLATE_FONT_VARIABLES} min-h-screen overflow-x-clip antialiased`} style={{ backgroundColor: background, color: text, fontFamily: "var(--tpl-font-sans, sans-serif)" }}>
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")" }} />

      <nav className="relative z-20 mx-auto flex max-w-[1500px] items-center justify-between border-b px-6 py-6 sm:px-10 lg:px-14" style={{ borderColor: border }}>
        <a href="#profile" className="text-sm font-bold uppercase tracking-[-0.02em]">{data.profile.fullName || "Vanguard Studio"}<span style={{ color: accent }}>®</span></a>
        <div className="hidden gap-8 text-[10px] font-semibold uppercase tracking-[0.18em] md:flex" style={{ color: textMuted }}>
          {data.projects.length > 0 && <a href="#work" className="hover:opacity-60">Work</a>}
          {data.expertise.length > 0 && <a href="#expertise" className="hover:opacity-60">Practice</a>}
          <a href="#contact" className="hover:opacity-60">Contact</a>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: textMuted }}>{year} / Independent</span>
      </nav>

      <main>
        {!hidden("hero") && !hidden("profile") && (
          <section id="profile" className="relative mx-auto grid min-h-[calc(100dvh-73px)] max-w-[1500px] content-between px-6 py-12 sm:px-10 md:py-16 lg:px-14">
            <div className="grid items-end gap-12 lg:grid-cols-[1fr_260px]">
              <Reveal>
                <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>Strategy · Identity · Digital</p>
                <h1 data-field-id="hero.headline" className="max-w-[13ch] text-balance text-[clamp(3.5rem,10vw,9rem)] font-semibold leading-[0.82] tracking-[-0.07em]">{data.hero.headline}</h1>
              </Reveal>
              <Reveal delay={0.15} className="lg:pb-2">
                <p data-field-id="hero.subheadline" className="text-base leading-7" style={{ color: textMuted }}>{data.hero.subheadline || data.profile.headline}</p>
                {data.profile.location && <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Operating from {data.profile.location}</p>}
              </Reveal>
            </div>
            <Reveal delay={0.25} className="mt-20 flex items-end justify-between border-t pt-5" >
              <a href="#work" className="group flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]"><span data-field-id="hero.ctaLabel">{data.hero.ctaLabel}</span><ArrowDown className="transition-transform duration-300 group-hover:translate-y-1" /></a>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: textMuted }}>Selected archive / {projectCount}</span>
            </Reveal>
          </section>
        )}

        {!hidden("projects") && data.projects.length > 0 && (
          <section id="work" className="border-t py-24 md:py-36" style={{ borderColor: border }}>
            <div className="mx-auto max-w-[1500px] px-6 sm:px-10 lg:px-14">
              {sectionLabel("01", "Selected work")}
              <div className="space-y-28 md:space-y-40">
                {data.projects.map((project, index) => {
                  const reverse = index % 2 === 1;
                  return (
                    <article key={`${project.title}-${index}`} data-item-index={index} data-section-type="projects" className="group">
                      <Reveal>
                        <a href={project.link || undefined} target={project.link ? "_blank" : undefined} rel={project.link ? "noreferrer" : undefined} className="grid gap-7 md:grid-cols-12 md:items-end">
                          <div className={`relative overflow-hidden md:col-span-8 ${reverse ? "md:col-start-5 md:row-start-1" : ""}`} style={{ backgroundColor: surface }}>
                            {project.imageUrl ? <motion.img src={project.imageUrl} alt={project.title} className="aspect-[16/10] h-full w-full object-cover" whileHover={{ scale: 1.025 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} /> : <div className="flex aspect-[16/10] items-center justify-center text-[12vw] font-semibold tracking-[-0.08em] opacity-10">{String(index + 1).padStart(2, "0")}</div>}
                            <span className="absolute left-4 top-4 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: background, color: text }}>{String(index + 1).padStart(2, "0")} / {projectCount}</span>
                          </div>
                          <div className={`md:col-span-4 ${reverse ? "md:col-start-1 md:row-start-1" : ""}`}>
                            <div className="flex items-start justify-between gap-5 border-t pt-5" style={{ borderColor: border }}>
                              <div><h2 data-field-id={`projects.${index}.title`} className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{project.title}</h2><p data-field-id={`projects.${index}.description`} className="mt-5 max-w-[38ch] text-sm leading-7" style={{ color: textMuted }}>{project.description}</p></div>
                              <ArrowUpRight size={24} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" style={{ color: accent }} />
                            </div>
                          </div>
                        </a>
                      </Reveal>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {!hidden("expertise") && data.expertise.length > 0 && (
          <section id="expertise" className="border-t py-24 md:py-36" style={{ borderColor: border, backgroundColor: surface }}>
            <div className="mx-auto max-w-[1500px] px-6 sm:px-10 lg:px-14">
              {sectionLabel("02", "Studio practice")}
              <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
                <Reveal><h2 className="max-w-[10ch] text-4xl font-semibold leading-none tracking-[-0.05em] md:text-6xl">Built for ambitious change.</h2></Reveal>
                <div className="border-t" style={{ borderColor: border }}>{data.expertise.map((item, index) => <Reveal key={`${item.title}-${index}`} delay={index * 0.05}><article data-item-index={index} data-section-type="expertise" className="grid gap-4 border-b py-7 md:grid-cols-[70px_1fr_1fr]" style={{ borderColor: border }}><span className="text-xs tabular-nums" style={{ color: accent }}>{String(index + 1).padStart(2, "0")}</span><h3 data-field-id={`expertise.${index}.title`} className="text-xl font-semibold tracking-tight">{item.title}</h3><p data-field-id={`expertise.${index}.description`} className="text-sm leading-7" style={{ color: textMuted }}>{item.description}</p></article></Reveal>)}</div>
              </div>
            </div>
          </section>
        )}

        {!hidden("testimonials") && data.testimonials.length > 0 && (
          <section id="testimonials" className="border-t py-24 md:py-36" style={{ borderColor: border }}><div className="mx-auto max-w-[1500px] px-6 sm:px-10 lg:px-14">{sectionLabel("03", "Perspectives")}<div className="grid gap-px md:grid-cols-2" style={{ backgroundColor: border }}>{data.testimonials.map((testimonial, index) => <Reveal key={`${testimonial.name}-${index}`}><blockquote className="flex h-full min-h-80 flex-col justify-between p-8 md:p-12" style={{ backgroundColor: background }}><p className="text-balance text-2xl font-medium leading-snug tracking-[-0.025em] md:text-3xl">“{testimonial.quote}”</p><footer className="mt-12 text-xs"><strong className="block font-semibold">{testimonial.name}</strong><span style={{ color: textMuted }}>{testimonial.role}</span></footer></blockquote></Reveal>)}</div></div></section>
        )}

        {!hidden("contact") && (
          <section id="contact" className="border-t" style={{ borderColor: border, backgroundColor: accent, color: background }}>
            <div className="mx-auto max-w-[1500px] px-6 py-20 sm:px-10 md:py-28 lg:px-14">
              <p className="mb-12 text-[10px] font-semibold uppercase tracking-[0.24em] opacity-70">04 / New business</p>
              <a href={data.contact.email ? `mailto:${data.contact.email}` : undefined} className="group flex items-end justify-between gap-8 border-b pb-8" style={{ borderColor: `${background}55` }}><h2 className="max-w-[12ch] text-5xl font-semibold leading-[0.9] tracking-[-0.065em] sm:text-7xl lg:text-9xl">Make something matter.</h2><ArrowUpRight className="mb-2 shrink-0 transition-transform duration-300 group-hover:-translate-y-2 group-hover:translate-x-2" size={40} /></a>
              <div className="mt-8 flex flex-col gap-6 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-6 gap-y-2">{data.contact.email && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}{data.contact.phone && <a href={`tel:${data.contact.phone}`}>{data.contact.phone}</a>}{whatsappDigits && <a href={`https://wa.me/${whatsappDigits}`}>WhatsApp</a>}</div>
                <div className="flex items-center gap-4">{data.socials.map((social, index) => <a key={`${social.platform}-${index}`} href={social.url} aria-label={social.platform} className="transition-opacity hover:opacity-60"><SocialIcon platform={social.platform} size={18} /></a>)}<span className="ml-3 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">© {year}</span></div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export { StudioRenderer as StudioTemplate };
