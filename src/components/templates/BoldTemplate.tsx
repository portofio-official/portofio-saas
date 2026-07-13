import { templateFontClass } from "@/lib/templates/fonts";
import { formatMonth, SocialIcon } from "@/components/templates/shared";
import type { PortfolioData } from "@/lib/portfolio/types";

export function BoldTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-full bg-white text-neutral-900`}>
      <header className="px-8 py-20 text-white" style={{ backgroundColor: theme.accentColor }}>
        <div className="mx-auto max-w-3xl">
          {profile.headline && (
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              {profile.headline}
            </p>
          )}
          <h1 className="mt-3 text-6xl font-black leading-none">{profile.fullName || "Your Name"}</h1>
          {profile.location && <p className="mt-4 text-white/80">{profile.location}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-8 py-16">
        {profile.bio && <p className="text-xl leading-8 text-neutral-700">{profile.bio}</p>}

        {projects.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black">Projects</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {projects.map((project, i) => (
                <a
                  key={i}
                  href={project.link || undefined}
                  className="block overflow-hidden rounded-2xl bg-neutral-100"
                >
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.imageUrl} alt="" className="h-40 w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-40 w-full items-center justify-center text-2xl font-black text-neutral-400"
                      style={{ backgroundColor: `${theme.accentColor}1a` }}
                    >
                      {project.title.slice(0, 1) || "?"}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-bold">{project.title}</p>
                    <p className="mt-1 text-sm text-neutral-600">{project.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black">Experience</h2>
            <div className="mt-6 flex flex-col gap-6">
              {experiences.map((exp, i) => (
                <div key={i} className="border-l-4 pl-4" style={{ borderColor: theme.accentColor }}>
                  <p className="font-bold">
                    {exp.role} · {exp.company}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                  </p>
                  {exp.description && <p className="mt-1 text-neutral-600">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black">Skills</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {educations.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black">Education</h2>
            <div className="mt-6 flex flex-col gap-3">
              {educations.map((edu, i) => (
                <p key={i} className="text-neutral-700">
                  <span className="font-bold">{edu.institution}</span>
                  {edu.degree ? ` — ${edu.degree}` : ""} ({edu.startYear}
                  {edu.endYear ? `–${edu.endYear}` : ""})
                </p>
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
