import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { PortfolioData } from "@/lib/portfolio/types";

export function DarkTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;
  const ringStyle = { boxShadow: `0 0 0 2px ${theme.accentColor}` };

  return (
    <div className={`${templateFontClass(theme.font)} min-h-full bg-neutral-950 text-neutral-100`}>
      <div className="mx-auto max-w-3xl px-8 py-16">
        <header className="flex items-center gap-5 border-b border-white/10 pb-8">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
              style={ringStyle}
            />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-lg font-medium text-neutral-300"
              style={ringStyle}
            >
              {initials(profile.fullName)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold">{profile.fullName || "Your Name"}</h1>
            {profile.headline && (
              <p className="mt-1" style={{ color: theme.accentColor }}>
                {profile.headline}
              </p>
            )}
            {profile.location && <p className="mt-1 text-sm text-neutral-400">{profile.location}</p>}
          </div>
        </header>

        {profile.bio && <p className="mt-8 leading-7 text-neutral-300">{profile.bio}</p>}

        {skills.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-neutral-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500">Experience</h2>
            <div className="mt-4 flex flex-col gap-5">
              {experiences.map((exp, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-medium">
                    {exp.role} <span className="text-neutral-500">@ {exp.company}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                  </p>
                  {exp.description && <p className="mt-2 text-sm text-neutral-400">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500">Projects</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((project, i) => (
                <a
                  key={i}
                  href={project.link || undefined}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="font-medium" style={{ color: theme.accentColor }}>
                    {project.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">{project.description}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {educations.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500">Education</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-neutral-400">
              {educations.map((edu, i) => (
                <p key={i}>
                  {edu.institution} — {edu.startYear}
                  {edu.endYear ? `–${edu.endYear}` : ""}
                </p>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6 text-sm text-neutral-400">
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {socials.map((social, i) => (
            <a key={i} href={social.url} className="text-neutral-400">
              <SocialIcon platform={social.platform} size={16} />
            </a>
          ))}
        </footer>
      </div>
    </div>
  );
}
