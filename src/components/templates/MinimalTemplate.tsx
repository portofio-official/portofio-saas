import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

export function MinimalTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-screen bg-[#FAFAFA] text-[#111111] selection:bg-[#111111] selection:text-[#FAFAFA] font-light`}>
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-32">

        {/* Header / Bio */}
        <header className="mb-24 md:mb-40 max-w-4xl">
          <div className="flex items-center gap-6 mb-16">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt="" className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover grayscale opacity-90" />
            ) : (
              <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-neutral-200 text-xl font-medium text-neutral-500">
                {initials(profile.fullName)}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-[#111]">{profile.fullName || "Your Name"}</h1>
              {profile.location && <p className="text-sm md:text-base text-neutral-500 mt-1">{profile.location}</p>}
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.2] tracking-tight text-[#111] mb-10">
            {profile.headline}
          </h2>
          {profile.bio && (
            <p className="text-xl md:text-2xl leading-relaxed text-neutral-500 max-w-3xl">
              {profile.bio}
            </p>
          )}
        </header>

        {/* Selected Work */}
        {projects.length > 0 && (
          <section className="mb-24 md:mb-40">
            <h3 className="text-lg md:text-xl font-medium text-neutral-400 mb-12 pb-4 border-b border-neutral-200">Selected Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
              {projects.map((project, i) => (
                <a key={i} href={project.link || undefined} className="group block">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 mb-6 relative">
                    {project.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.imageUrl} alt="" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-light text-neutral-300">
                        {project.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <h4 className="text-2xl font-medium" style={{ color: theme.accentColor }}>{project.title}</h4>
                    <span className="text-neutral-400 text-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">↗</span>
                  </div>
                  <p className="text-neutral-500 text-lg leading-relaxed max-w-md">{project.description}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 mb-24 md:mb-40">

          {/* Experience */}
          {experiences.length > 0 && (
            <section className="md:col-span-7">
              <h3 className="text-lg md:text-xl font-medium text-neutral-400 mb-12 pb-4 border-b border-neutral-200">Experience</h3>
              <div className="flex flex-col gap-16">
                {experiences.map((exp, i) => (
                  <div key={i} className="group">
                    <p className="text-sm text-neutral-400 mb-3 font-mono tracking-wide">
                      {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "Present"}
                    </p>
                    <h4 className="text-2xl font-medium mb-1 text-[#111]">{exp.role}</h4>
                    <p className="text-xl text-neutral-500 mb-5">{exp.company}</p>
                    {exp.description && <p className="text-lg text-neutral-600 leading-relaxed max-w-xl">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sidebar */}
          <div className="md:col-span-5 flex flex-col gap-20">
            {/* Education */}
            {educations.length > 0 && (
              <section>
                <h3 className="text-lg md:text-xl font-medium text-neutral-400 mb-12 pb-4 border-b border-neutral-200">Education</h3>
                <div className="flex flex-col gap-10">
                  {educations.map((edu, i) => (
                    <div key={i}>
                      <h4 className="text-xl font-medium mb-1 text-[#111]">{edu.institution}</h4>
                      <p className="text-lg text-neutral-500 mb-3">{edu.degree}</p>
                      <p className="text-sm text-neutral-400 font-mono tracking-wide">
                        {edu.startYear} — {edu.endYear || "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Capabilities */}
            {skills.length > 0 && (
              <section>
                <h3 className="text-lg md:text-xl font-medium text-neutral-400 mb-12 pb-4 border-b border-neutral-200">Capabilities</h3>
                <ul className="flex flex-col gap-4">
                  {skills.map((skill) => (
                    <li key={skill} className="text-lg text-neutral-600">
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-20 border-t border-neutral-200 flex flex-col md:flex-row items-baseline justify-between gap-12">
          <div>
            <h2 className="text-5xl md:text-6xl font-medium tracking-tight mb-8 text-[#111]">Let&apos;s talk</h2>
            <div className="flex flex-col gap-4">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="text-xl md:text-2xl text-neutral-500 hover:text-[#111] transition-colors w-fit pb-1 border-b border-transparent hover:border-[#111]">
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <span className="text-lg text-neutral-500">{contact.phone}</span>
              )}
            </div>
          </div>

          <div className="flex gap-8">
            {socials.map((social, i) => (
              <a key={i} href={social.url} className="text-neutral-400 hover:text-[#111] transition-transform hover:scale-110">
                <SocialIcon platform={social.platform} size={28} />
              </a>
            ))}
          </div>
        </footer>

      </div>
    </div>
  );
}
