"use client";

import { templateFontClass } from "@/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/templates/shared";
import type { CorporateData as PortfolioData } from "./schema";
import type { WorkspaceProfile } from "@/templates/definition";

export function CorporateRenderer({ data }: { data: PortfolioData; workspaceProfile?: WorkspaceProfile }) {
  const { profile, experiences, educations, skills, pricing, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-screen bg-[#FDFDFD] text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900`}>
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
        
        <header className="border-b border-zinc-200 pb-12 md:pb-16 mb-12 md:pb-20 md:mb-20">
          <div className="flex flex-col-reverse md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-zinc-900 leading-tight">
                {profile.fullName || "Your Name"}
              </h1>
              {profile.headline && (
                <p className="mt-4 text-xl md:text-2xl text-zinc-500 font-light" style={{ color: theme.accentColor }}>
                  {profile.headline}
                </p>
              )}
              {profile.bio && (
                <p className="mt-8 text-base md:text-lg text-zinc-600 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}
              {profile.location && (
                <p className="mt-8 text-sm text-zinc-400 font-medium">
                  {profile.location}
                </p>
              )}
            </div>
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt={profile.fullName || "Profile photo"} className="h-32 w-32 md:h-48 md:w-48 lg:h-56 lg:w-56 object-cover shrink-0 grayscale hover:grayscale-0 transition-all duration-500" />
            ) : (
              <div className="h-32 w-32 md:h-48 md:w-48 lg:h-56 lg:w-56 shrink-0 bg-zinc-100 flex items-center justify-center text-3xl font-medium text-zinc-400">
                {initials(profile.fullName)}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <main className="lg:col-span-8 lg:col-start-5 space-y-20">
            
            {experiences.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-900 border-b border-zinc-200 pb-3 mb-8">
                  Professional Experience
                </h2>
                <div className="flex flex-col gap-12">
                  {experiences.map((exp, i) => (
                    <div key={i} className="group">
                      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2 gap-2">
                        <h3 className="text-xl font-medium text-zinc-900">
                          {exp.role}
                        </h3>
                        <p className="text-sm text-zinc-500 tabular-nums shrink-0">
                          {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                        </p>
                      </div>
                      <p className="text-base font-medium mb-4" style={{ color: theme.accentColor }}>
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pricing && pricing.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-900 border-b border-zinc-200 pb-3 mb-8">
                  Pricing Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pricing.map((tier, i) => (
                    <div key={i} className={`p-6 border rounded-lg ${tier.highlighted ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"}`}>
                      <h3 className="text-lg font-medium text-zinc-900">{tier.name}</h3>
                      <p className="mt-2 text-2xl font-bold text-zinc-900">
                        {tier.currency} {tier.price.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-zinc-500">/{tier.period}</span>
                      </p>
                      {tier.features.length > 0 && (
                        <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                          {tier.features.map((feat, fj) => (
                            <li key={fj} className="flex items-center gap-2">
                              <span>✓</span> {feat}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="lg:col-span-4 lg:col-start-1 lg:row-start-1 flex flex-col gap-16 lg:pr-8">
            
            {(contact.email || contact.phone || contact.whatsapp || socials.length > 0) && (
              <section>
                <h2 className="text-sm font-medium text-zinc-900 border-b border-zinc-200 pb-3 mb-6">
                  Contact
                </h2>
                <div className="flex flex-col gap-3 text-sm text-zinc-600">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="hover:text-zinc-900 transition-colors w-fit">
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <span>{contact.phone}</span>
                  )}
                  {contact.whatsapp && (
                    <span>WA: {contact.whatsapp}</span>
                  )}
                </div>
                
                {socials.length > 0 && (
                  <div className="mt-6 flex gap-4">
                    {socials.map((social, i) => (
                      <a key={i} href={social.url} className="text-zinc-400 hover:text-zinc-900 transition-colors" aria-label={social.platform}>
                        <SocialIcon platform={social.platform} size={20} />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}

            {educations.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-900 border-b border-zinc-200 pb-3 mb-6">
                  Education
                </h2>
                <div className="flex flex-col gap-6">
                  {educations.map((edu, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-medium text-zinc-900">{edu.institution}</h3>
                      <p className="text-sm text-zinc-600 mt-1">
                        {edu.degree}
                        {edu.field ? `, ${edu.field}` : ""}
                      </p>
                      <p className="text-sm text-zinc-500 mt-2 tabular-nums">
                        {edu.startYear} {edu.endYear ? `— ${edu.endYear}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-900 border-b border-zinc-200 pb-3 mb-6">
                  Core Competencies
                </h2>
                <ul className="flex flex-col gap-2">
                  {skills.map((skill) => (
                    <li key={skill} className="text-sm text-zinc-600 flex items-start gap-3">
                      <span className="mt-2 w-1 h-1 bg-zinc-300 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
}

export { CorporateRenderer as CorporateTemplate };
