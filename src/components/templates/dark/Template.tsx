"use client";

import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

export function DarkTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-screen bg-[#09090b] text-zinc-300 selection:bg-zinc-800 selection:text-white relative overflow-hidden`}>
      
      {/* Ambient Glow */}
      <div 
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[120px] pointer-events-none"
        style={{ backgroundColor: theme.accentColor }}
      />

      <div className="mx-auto max-w-5xl px-6 py-20 md:px-12 md:py-32 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16 mb-20 md:mb-32">
          {profile.photoUrl ? (
            <div className="relative group shrink-0">
              <div className="absolute inset-0 rounded-2xl opacity-50 blur-xl group-hover:opacity-100 transition-opacity duration-700" style={{ backgroundColor: theme.accentColor }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photoUrl}
                alt={profile.fullName || "Profile"}
                className="relative h-32 w-32 md:h-40 md:w-40 rounded-2xl object-cover ring-1 ring-white/10 shadow-2xl"
              />
            </div>
          ) : (
            <div className="relative group shrink-0">
              <div className="absolute inset-0 rounded-2xl opacity-50 blur-xl group-hover:opacity-100 transition-opacity duration-700" style={{ backgroundColor: theme.accentColor }} />
              <div
                className="relative flex h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-2xl bg-zinc-900/80 backdrop-blur-md ring-1 ring-white/10 shadow-2xl text-3xl font-medium text-white"
              >
                {initials(profile.fullName)}
              </div>
            </div>
          )}
          
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-4">
              {profile.fullName || "Your Name"}
            </h1>
            {profile.headline && (
              <p className="text-xl md:text-2xl text-zinc-400 font-light mb-4">
                {profile.headline}
              </p>
            )}
            {profile.location && (
              <p className="flex items-center gap-2 text-sm font-mono text-zinc-500 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                {profile.location}
              </p>
            )}
          </div>
        </header>

        {/* Bio */}
        {profile.bio && (
          <section className="mb-24 md:mb-32 max-w-3xl">
            <p className="text-xl md:text-3xl leading-[1.6] text-zinc-300 font-medium">
              {profile.bio}
            </p>
          </section>
        )}

        {/* Projects Bento */}
        {projects.length > 0 && (
          <section className="mb-24 md:mb-32">
            <h2 className="text-2xl font-semibold text-white mb-10">Selected Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, i) => (
                <a
                  key={i}
                  href={project.link || undefined}
                  className="group block relative rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden hover:border-white/20 transition-colors duration-500"
                >
                  {/* Subtle inner shadow for glassmorphism */}
                  <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none rounded-3xl" />
                  
                  {project.imageUrl ? (
                    <div className="aspect-[16/9] w-full overflow-hidden border-b border-white/5 bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={project.imageUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full overflow-hidden border-b border-white/5 bg-zinc-950 flex items-center justify-center">
                      <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors duration-700">{project.title.slice(0, 1)}</span>
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-xl font-medium text-white mb-3 flex items-center justify-between">
                      <span>{project.title}</span>
                      <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-sm" style={{ color: theme.accentColor }}>
                        ↗
                      </span>
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
          
          {/* Experience */}
          {experiences.length > 0 && (
            <section className="lg:col-span-7">
              <h2 className="text-2xl font-semibold text-white mb-10">Experience</h2>
              <div className="flex flex-col gap-12">
                {experiences.map((exp, i) => (
                  <div key={i} className="relative pl-6 md:pl-8 border-l border-zinc-800 hover:border-zinc-600 transition-colors duration-300">
                    <div 
                      className="absolute -left-[5px] top-2 w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      style={{ backgroundColor: theme.accentColor }} 
                    />
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                      <h3 className="text-lg font-medium text-zinc-100">{exp.role}</h3>
                      <span className="text-sm font-medium text-zinc-500">at {exp.company}</span>
                    </div>
                    <p className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">
                      {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-16">
            
            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-8">Technical Output</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-8">Education</h2>
                <div className="flex flex-col gap-8">
                  {educations.map((edu, i) => (
                    <div key={i} className="group">
                      <h3 className="text-base font-medium text-zinc-200 mb-1 group-hover:text-white transition-colors">{edu.institution}</h3>
                      <p className="text-sm text-zinc-500 mb-2">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </p>
                      <p className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                        {edu.startYear} — {edu.endYear || "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {contact.email && (
              <a 
                href={`mailto:${contact.email}`} 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <span className="text-sm text-zinc-500 font-mono">{contact.phone}</span>
            )}
          </div>
          
          <div className="flex gap-4">
            {socials.map((social, i) => (
              <a 
                key={i} 
                href={social.url} 
                className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all duration-300"
              >
                <SocialIcon platform={social.platform} size={18} />
              </a>
            ))}
          </div>
        </footer>

      </div>
    </div>
  );
}
