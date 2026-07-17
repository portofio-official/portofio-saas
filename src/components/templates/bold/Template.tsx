"use client";

import { templateFontClass } from "@/lib/templates/fonts";
import { formatMonth, SocialIcon } from "@/components/templates/shared";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

export function BoldTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-screen bg-zinc-50 text-zinc-950 selection:bg-zinc-900 selection:text-zinc-50`}>
      {/* Hero Section */}
      <header className="px-6 py-24 md:px-12 md:py-40 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <h1 className="text-[12vw] lg:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase break-words">
              {profile.fullName || "YOUR NAME"}
            </h1>
          </div>
          <div className="lg:col-span-4 pb-2 lg:pb-6">
            {profile.headline && (
              <p className="text-xl md:text-3xl font-bold tracking-tight text-zinc-600 uppercase" style={{ color: theme.accentColor }}>
                {profile.headline}
              </p>
            )}
            {profile.location && (
              <p className="mt-4 text-sm font-mono tracking-widest uppercase text-zinc-400">
                {"// "} {profile.location}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Bio Section */}
      {profile.bio && (
        <section className="px-6 md:px-12 py-16 md:py-32 border-t-[6px] border-zinc-950 max-w-screen-2xl mx-auto">
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tighter max-w-6xl">
            {profile.bio}
          </p>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-32 border-t-[6px] border-zinc-950 max-w-screen-2xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-16">Selected Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {projects.map((project, i) => (
              <a
                key={i}
                href={project.link || undefined}
                className="group block"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-200 relative">
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[12rem] font-black mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundColor: theme.accentColor, color: 'rgba(255,255,255,0.7)' }}
                    >
                      {project.title.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="mt-8 flex flex-col xl:flex-row xl:items-baseline xl:justify-between gap-4">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight uppercase group-hover:underline underline-offset-8 decoration-4">
                    {project.title}
                  </h3>
                  <p className="text-lg font-medium text-zinc-500 max-w-sm xl:text-right">
                    {project.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experiences.length > 0 && (
        <section className="px-6 md:px-12 py-16 md:py-32 border-t-[6px] border-zinc-950 max-w-screen-2xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-20">Experience</h2>
          <div className="grid grid-cols-1 gap-16">
            {experiences.map((exp, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-12 items-start border-b-2 border-zinc-200 pb-16">
                <div className="md:col-span-4 lg:col-span-3 pt-2">
                  <p className="text-sm font-mono tracking-widest uppercase text-zinc-500">
                    {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "PRESENT"}
                  </p>
                </div>
                <div className="md:col-span-8 lg:col-span-9">
                  <h3 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none" style={{ color: theme.accentColor }}>
                    {exp.role}
                  </h3>
                  <p className="text-2xl md:text-4xl font-bold mt-4 text-zinc-800 uppercase">
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="mt-8 text-xl md:text-2xl text-zinc-600 leading-relaxed max-w-4xl">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Education Section */}
      <section className="px-6 md:px-12 py-16 md:py-32 border-t-[6px] border-zinc-950 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
          {skills.length > 0 && (
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">Arsenal</h2>
              <div className="flex flex-wrap gap-4">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-6 py-4 text-sm md:text-base font-bold uppercase tracking-widest border-[3px] border-zinc-950 hover:bg-zinc-950 hover:text-zinc-50 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {educations.length > 0 && (
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">Education</h2>
              <div className="flex flex-col gap-12">
                {educations.map((edu, i) => (
                  <div key={i}>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                      {edu.institution}
                    </h3>
                    {edu.degree && (
                      <p className="mt-2 text-xl font-bold text-zinc-600">
                        {edu.degree}
                      </p>
                    )}
                    <p className="mt-4 text-sm font-mono tracking-widest text-zinc-500">
                      {edu.startYear} — {edu.endYear || "PRESENT"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-50 px-6 md:px-12 py-24 md:py-40">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-end">
          <div>
            <h2 className="text-6xl md:text-8xl lg:text-[8rem] font-black uppercase tracking-tighter mb-12 leading-[0.85]" style={{ color: theme.accentColor }}>
              Let&apos;s Build <br/> Something.
            </h2>
            <div className="flex flex-col gap-4 text-2xl font-medium text-zinc-400">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="hover:text-zinc-50 hover:underline underline-offset-8 transition-colors w-fit">
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <span className="w-fit">{contact.phone}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap md:justify-end gap-8 text-zinc-500">
            {socials.map((social, i) => (
              <a key={i} href={social.url} className="hover:text-zinc-50 hover:scale-110 transition-all duration-300">
                <SocialIcon platform={social.platform} size={40} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
