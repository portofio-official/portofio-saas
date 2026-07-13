import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { PortfolioData } from "@/lib/portfolio/types";

export function MinimalTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-full bg-white text-neutral-900`}>
      <div className="mx-auto max-w-2xl px-8 py-16">
        <header className="flex items-center gap-5 border-b border-neutral-200 pb-8">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-lg font-medium text-neutral-500">
              {initials(profile.fullName)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-medium">{profile.fullName || "Your Name"}</h1>
            {profile.headline && (
              <p className="mt-1" style={{ color: theme.accentColor }}>
                {profile.headline}
              </p>
            )}
            {profile.location && <p className="mt-1 text-sm text-neutral-500">{profile.location}</p>}
          </div>
        </header>

        {profile.bio && <p className="mt-8 text-lg leading-8 text-neutral-700">{profile.bio}</p>}

        {experiences.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400">Experience</h2>
            <div className="mt-4 flex flex-col gap-6">
              {experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="font-medium">
                      {exp.role} · {exp.company}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                    </p>
                  </div>
                  {exp.description && <p className="mt-1 text-neutral-600">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {educations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400">Education</h2>
            <div className="mt-4 flex flex-col gap-4">
              {educations.map((edu, i) => (
                <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-medium">
                    {edu.institution}
                    {edu.degree ? ` — ${edu.degree}` : ""}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {edu.startYear}
                    {edu.endYear ? `–${edu.endYear}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400">Skills</h2>
            <p className="mt-4 text-neutral-700">{skills.join(" · ")}</p>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400">Projects</h2>
            <div className="mt-4 flex flex-col gap-6">
              {projects.map((project, i) => (
                <a key={i} href={project.link || undefined} className="block">
                  <p className="font-medium" style={project.link ? { color: theme.accentColor } : undefined}>
                    {project.title}
                  </p>
                  <p className="mt-1 text-neutral-600">{project.description}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-8 text-sm text-neutral-500">
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.phone && <span>{contact.phone}</span>}
          {socials.map((social, i) => (
            <a key={i} href={social.url} className="text-neutral-500">
              <SocialIcon platform={social.platform} size={16} />
            </a>
          ))}
        </footer>
      </div>
    </div>
  );
}
