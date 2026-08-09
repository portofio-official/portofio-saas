"use client";

import { initials, formatMonth, SocialIcon } from "@/templates/shared";
import { TEMPLATE_FONT_VARIABLES } from "@/templates/fonts";
import type { CorporateData as PortfolioData } from "./schema";
import type { WorkspaceProfile } from "@/templates/definition";
import { corporateDefinition } from "./definition";

type CorporateColors = (typeof corporateDefinition.variants)[number]["colors"];

function SectionLabel({ index, label, colors }: { index: string; label: string; colors: CorporateColors }) {
  return (
    <div className="mb-8 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: colors.textMuted }}>
      <span className="tabular-nums" style={{ color: colors.primary }}>{index}</span>
      <span className="h-px w-8" style={{ backgroundColor: colors.border }} />
      <span>{label}</span>
    </div>
  );
}

export function CorporateRenderer({ data }: { data: PortfolioData; workspaceProfile?: WorkspaceProfile }) {
  const { profile, experiences, educations, skills, pricing, contact, socials, theme, hiddenSections } = data;
  const hidden = (id: string) => hiddenSections?.includes(id) ?? false;
  const variant = corporateDefinition.variants.find((v) => v.id === theme.variantId) || corporateDefinition.variants[0];
  const colors = variant.colors;
  const whatsappDigits = contact.whatsapp?.replace(/\D/g, "");
  const year = new Date().getFullYear();
  const navItems = [
    !hidden("experience") && experiences.length > 0 ? ["Experience", "experience"] : null,
    !hidden("education") && educations.length > 0 ? ["Education", "education"] : null,
    !hidden("skills") && skills.length > 0 ? ["Capabilities", "skills"] : null,
    !hidden("pricing") && pricing.length > 0 ? ["Engagements", "pricing"] : null,
    !hidden("contact") && (contact.email || contact.phone || contact.whatsapp || socials.length) ? ["Contact", "contact"] : null,
  ].filter(Boolean) as string[][];

  return (
    <div
      className={`${TEMPLATE_FONT_VARIABLES} min-h-screen overflow-x-clip antialiased selection:bg-slate-200`}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-16">
        <nav className="flex items-center justify-between border-b py-6" style={{ borderColor: colors.border }}>
          <a href="#profile" className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: colors.text }}>
            {profile.fullName || "Portfolio"}<span style={{ color: colors.primary }}>.</span>
          </a>
          <div className="hidden items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.16em] md:flex" style={{ color: colors.textMuted }}>
            {navItems.slice(0, 4).map(([label, id]) => <a key={id} href={`#${id}`} className="transition-opacity hover:opacity-60" style={{ color: colors.textMuted }}>{label}</a>)}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] tabular-nums" style={{ color: colors.textMuted }}>{year}</span>
        </nav>

        {!hidden("profile") && (
          <header id="profile" className="grid gap-12 border-b py-20 md:grid-cols-[1fr_280px] md:items-end md:py-28 lg:grid-cols-[1fr_360px]" style={{ borderColor: colors.border }}>
            <div className="max-w-3xl">
              <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: colors.primary }}>Executive portfolio / {profile.location || "Independent practice"}</p>
              <h1 className="max-w-[13ch] text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-[6.8rem]" style={{ color: colors.text }}>{profile.fullName || "Your Name"}</h1>
              {profile.headline && <p className="mt-8 max-w-[32ch] text-xl font-medium leading-snug md:text-2xl" style={{ color: colors.primary }}>{profile.headline}</p>}
              {profile.bio && <p className="mt-7 max-w-[62ch] text-base leading-8" style={{ color: colors.textMuted }}>{profile.bio}</p>}
              <div className="mt-10 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: colors.textMuted }}>
                <span className="border px-3 py-2" style={{ borderColor: colors.border }}>Available for select engagements</span>
                <span className="px-3 py-2 tabular-nums" style={{ color: colors.primary }}>Based in {profile.location || "—"}</span>
              </div>
            </div>
            <div className="relative justify-self-start md:justify-self-end">
              <div className="absolute -inset-3 border" style={{ borderColor: colors.primary, opacity: 0.3 }} />
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoUrl} alt={profile.fullName || "Profile photo"} className="relative h-64 w-52 object-cover grayscale transition-all duration-500 hover:grayscale-0 md:h-80 md:w-64" />
              ) : (
                <div className="relative flex h-64 w-52 items-center justify-center text-5xl font-semibold md:h-80 md:w-64" style={{ backgroundColor: colors.surface, color: colors.primary }}>{initials(profile.fullName)}</div>
              )}
              <span className="absolute -bottom-4 -left-4 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: colors.primary, color: colors.background }}>01 / Profile</span>
            </div>
          </header>
        )}

        <div className="grid gap-20 py-20 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-28 lg:py-28">
          <main className="space-y-24">
            {experiences.length > 0 && !hidden("experience") && <section id="experience"><SectionLabel index="02" label="Professional experience" colors={colors} /><div className="space-y-0">{experiences.map((exp, i) => <article key={`${exp.company}-${i}`} className="grid gap-3 border-t py-7 md:grid-cols-[145px_1fr]" style={{ borderColor: colors.border }}><p className="text-xs font-medium tabular-nums" style={{ color: colors.textMuted }}>{formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}</p><div><h3 className="text-xl font-semibold tracking-tight">{exp.role}</h3><p className="mt-1 text-sm font-medium" style={{ color: colors.primary }}>{exp.company}</p>{exp.description && <p className="mt-4 max-w-[60ch] text-sm leading-7" style={{ color: colors.textMuted }}>{exp.description}</p>}</div></article>)}</div></section>}

            {pricing.length > 0 && !hidden("pricing") && <section id="pricing"><SectionLabel index="03" label="Engagements" colors={colors} /><div className="grid gap-px border" style={{ borderColor: colors.border, backgroundColor: colors.border }}>{pricing.map((tier, i) => <article key={`${tier.name}-${i}`} className="p-7 md:p-9" style={{ backgroundColor: tier.highlighted ? colors.surface : colors.background }}><div className="flex items-start justify-between gap-4"><h3 className="text-lg font-semibold">{tier.name}</h3>{tier.highlighted && <span className="text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: colors.primary }}>Recommended</span>}</div><p className="mt-5 text-3xl font-semibold tracking-tight">{tier.currency} {tier.price.toLocaleString()} <span className="text-xs font-medium" style={{ color: colors.textMuted }}> / {tier.period}</span></p>{tier.features.length > 0 && <ul className="mt-6 space-y-3 text-sm" style={{ color: colors.textMuted }}>{tier.features.map((feat, j) => <li key={j} className="flex gap-3"><span style={{ color: colors.primary }}>—</span>{feat}</li>)}</ul>}</article>)}</div></section>}
          </main>

          <aside className="space-y-16 lg:pt-1">
            {educations.length > 0 && !hidden("education") && <section id="education"><SectionLabel index="04" label="Education" colors={colors} /><div className="space-y-7">{educations.map((edu, i) => <div key={`${edu.institution}-${i}`}><h3 className="text-sm font-semibold">{edu.institution}</h3><p className="mt-1 text-sm" style={{ color: colors.textMuted }}>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</p><p className="mt-2 text-xs tabular-nums" style={{ color: colors.textMuted }}>{edu.startYear}{edu.endYear ? ` — ${edu.endYear}` : ""}</p></div>)}</div></section>}
            {skills.length > 0 && !hidden("skills") && <section id="skills"><SectionLabel index="05" label="Capabilities" colors={colors} /><div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="border px-3 py-2 text-xs" style={{ borderColor: colors.border, color: colors.textMuted }}>{skill}</span>)}</div></section>}
            {(contact.email || contact.phone || contact.whatsapp || socials.length > 0) && !hidden("contact") && <section id="contact"><SectionLabel index="06" label="Contact" colors={colors} /><div className="space-y-3 text-sm" style={{ color: colors.textMuted }}>{contact.email && <a href={`mailto:${contact.email}`} className="block transition-opacity hover:opacity-60" style={{ color: colors.textMuted }}>{contact.email}</a>}{contact.phone && <p>{contact.phone}</p>}{whatsappDigits && <a href={`https://wa.me/${whatsappDigits}`} className="block transition-opacity hover:opacity-60" style={{ color: colors.textMuted }}>WhatsApp</a>}</div>{socials.length > 0 && <div className="mt-6 flex gap-4">{socials.map((social, i) => <a key={`${social.platform}-${i}`} href={social.url} aria-label={social.platform} className="transition-opacity hover:opacity-60" style={{ color: colors.primary }}><SocialIcon platform={social.platform} size={18} /></a>)}</div>}</section>}
          </aside>
        </div>

        <footer className="flex flex-col gap-4 border-t py-8 text-[10px] font-semibold uppercase tracking-[0.18em] sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: colors.border, color: colors.textMuted }}><span>{profile.fullName || "Portfolio"}</span><span>Confidential profile · {year}</span></footer>
      </div>
    </div>
  );
}

export { CorporateRenderer as CorporateTemplate };
