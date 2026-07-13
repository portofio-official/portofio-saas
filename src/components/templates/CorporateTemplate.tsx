import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { PortfolioData } from "@/lib/portfolio/types";

export function CorporateTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-full bg-white text-neutral-900`}>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-8 py-14 md:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-8">
          <div>
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt="" className="h-24 w-24 rounded-xl object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-100 text-xl font-semibold text-neutral-500">
                {initials(profile.fullName)}
              </div>
            )}
            <h1 className="mt-4 text-xl font-semibold">{profile.fullName || "Your Name"}</h1>
            {profile.headline && (
              <p className="text-sm" style={{ color: theme.accentColor }}>
                {profile.headline}
              </p>
            )}
            {profile.location && <p className="mt-1 text-sm text-neutral-500">{profile.location}</p>}
          </div>

          {(contact.email || contact.phone || contact.whatsapp) && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Contact</h2>
              <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-700">
                {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                {contact.phone && <span>{contact.phone}</span>}
                {contact.whatsapp && <span>WhatsApp: {contact.whatsapp}</span>}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Skills</h2>
              <div className="mt-2 flex flex-col gap-1.5 text-sm text-neutral-700">
                {skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {educations.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Education</h2>
              <div className="mt-2 flex flex-col gap-2 text-sm text-neutral-700">
                {educations.map((edu, i) => (
                  <div key={i}>
                    <p className="font-medium">{edu.institution}</p>
                    <p className="text-neutral-500">
                      {edu.degree}
                      {edu.field ? `, ${edu.field}` : ""} · {edu.startYear}
                      {edu.endYear ? `–${edu.endYear}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map((social, i) => (
                <a key={i} href={social.url} className="text-neutral-500">
                  <SocialIcon platform={social.platform} size={16} />
                </a>
              ))}
            </div>
          )}
        </aside>

        <main>
          {profile.bio && <p className="text-lg leading-8 text-neutral-700">{profile.bio}</p>}

          {experiences.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                Work Experience
              </h2>
              <div className="mt-5 flex flex-col gap-8 border-l border-neutral-200 pl-6">
                {experiences.map((exp, i) => (
                  <div key={i} className="relative">
                    <span
                      className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <p className="text-sm text-neutral-500">
                      {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                    </p>
                    <p className="mt-0.5 font-semibold">{exp.role}</p>
                    <p className="text-neutral-600">{exp.company}</p>
                    {exp.description && <p className="mt-1 text-sm text-neutral-600">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Projects</h2>
              <div className="mt-4 flex flex-col gap-4">
                {projects.map((project, i) => (
                  <div key={i}>
                    <p className="font-semibold">{project.title}</p>
                    <p className="text-sm text-neutral-600">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
