import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { PortfolioData } from "@/lib/portfolio/types";

export function CreativeTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-full bg-neutral-50 text-neutral-900`}>
      <div className="mx-auto max-w-5xl px-8 py-14">
        <header className="flex flex-wrap items-center justify-between gap-6 pb-10">
          <div className="flex items-center gap-4">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-200 text-sm font-semibold text-neutral-500">
                {initials(profile.fullName)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold">{profile.fullName || "Your Name"}</h1>
              {profile.headline && <p className="text-sm text-neutral-500">{profile.headline}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((social, i) => (
              <a key={i} href={social.url} className="text-neutral-500">
                <SocialIcon platform={social.platform} size={18} />
              </a>
            ))}
          </div>
        </header>

        {projects.length > 0 && (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <a
                key={i}
                href={project.link || undefined}
                className="block overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-200">
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl font-semibold text-neutral-400">
                      {project.title.slice(0, 1) || "?"}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-semibold" style={{ color: theme.accentColor }}>
                    {project.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">{project.description}</p>
                </div>
              </a>
            ))}
          </section>
        )}

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            {profile.bio && <p className="text-lg leading-8 text-neutral-700">{profile.bio}</p>}

            {experiences.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  Experience
                </h2>
                <div className="mt-4 flex flex-col gap-5">
                  {experiences.map((exp, i) => (
                    <div key={i}>
                      <p className="font-medium">
                        {exp.role} · {exp.company}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8">
            {skills.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-white px-3 py-1 text-sm text-neutral-700 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {educations.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  Education
                </h2>
                <div className="mt-3 flex flex-col gap-2 text-sm text-neutral-700">
                  {educations.map((edu, i) => (
                    <p key={i}>
                      {edu.institution} {edu.startYear}
                      {edu.endYear ? `–${edu.endYear}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {(contact.email || contact.phone) && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Contact</h2>
                <div className="mt-3 flex flex-col gap-1 text-sm text-neutral-700">
                  {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                  {contact.phone && <span>{contact.phone}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
