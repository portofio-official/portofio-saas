import { templateFontClass } from "@/lib/templates/fonts";
import { initials, formatMonth, SocialIcon } from "@/components/templates/shared";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

export function CreativeTemplate({ data }: { data: PortfolioData }) {
  const { profile, experiences, educations, skills, projects, contact, socials, theme } = data;

  return (
    <div className={`${templateFontClass(theme.font)} min-h-screen bg-[#F0F0EA] text-[#111] selection:bg-[#111] selection:text-[#F0F0EA] overflow-hidden relative z-0`}>
      {/* Ambient background blobs for creative vibe */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-fuchsia-300/40 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[120px] animate-pulse pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[120px] pointer-events-none -z-10"></div>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        
        {/* Wild Hero Section */}
        <header className="relative mb-24 md:mb-40 pt-8 lg:pt-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt="" className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover rounded-[3rem] md:rounded-[4rem] transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-700 shadow-2xl shrink-0" />
            ) : (
              <div className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-zinc-200 rounded-[3rem] md:rounded-[4rem] transform -rotate-3 flex items-center justify-center text-6xl font-black text-zinc-400 shadow-2xl shrink-0">
                {initials(profile.fullName)}
              </div>
            )}
            
            <div className="text-center lg:text-left flex-1 mt-6 lg:mt-0">
              <h1 className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase break-words [-webkit-text-stroke:2px_#111] text-transparent hover:text-[#111] transition-colors duration-500 cursor-default">
                {profile.fullName || "YOUR NAME"}
              </h1>
              {profile.headline && (
                <p className="mt-8 text-2xl md:text-4xl lg:text-5xl font-medium tracking-tight text-zinc-700 max-w-3xl">
                  {profile.headline}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Bio */}
        {profile.bio && (
          <section className="mb-24 md:mb-40">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight max-w-6xl text-zinc-900">
              {profile.bio}
            </h2>
          </section>
        )}

        {/* Bento Projects Grid */}
        {projects.length > 0 && (
          <section className="mb-24 md:mb-40">
            <div className="flex items-end justify-between mb-12 border-b-4 border-zinc-900 pb-6">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                Selected Work
              </h2>
              <span className="text-xl md:text-3xl font-black text-zinc-400">[{projects.length}]</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
              {projects.map((project, i) => {
                let spanClass = "md:col-span-6";
                if (i % 3 === 0) spanClass = "md:col-span-8";
                if (i % 3 === 1) spanClass = "md:col-span-4";
                if (i % 3 === 2) spanClass = "md:col-span-12";
                if (projects.length === 1) spanClass = "md:col-span-12";
                
                return (
                  <a
                    key={i}
                    href={project.link || undefined}
                    className={`group relative block overflow-hidden rounded-[2rem] md:rounded-[3rem] ${spanClass} bg-zinc-200 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl`}
                  >
                    <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/50 transition-colors duration-500"></div>
                    <div className="aspect-[4/3] md:aspect-auto md:h-[40rem] w-full relative">
                      {project.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10rem] font-black opacity-20 transition-transform duration-1000 group-hover:scale-105" style={{ color: theme.accentColor }}>
                          {project.title.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 z-20 p-8 md:p-12 flex flex-col justify-end">
                      <h3 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                        {project.title}
                      </h3>
                      <p className="text-lg md:text-xl text-zinc-200 max-w-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        {project.description}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
          
          {/* Experience */}
          {experiences.length > 0 && (
            <div className="lg:col-span-7">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
                Experience
              </h2>
              <div className="flex flex-col gap-12">
                {experiences.map((exp, i) => (
                  <div key={i} className="group relative pl-8 md:pl-12 border-l-4 border-zinc-200 hover:border-zinc-900 transition-colors duration-500 pb-8">
                    <div className="absolute -left-[14px] top-0 w-6 h-6 bg-zinc-200 rounded-full group-hover:bg-zinc-900 transition-colors duration-500"></div>
                    <p className="text-sm md:text-base font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                      {formatMonth(exp.startDate)} — {exp.endDate ? formatMonth(exp.endDate) : "PRESENT"}
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-zinc-900">
                      {exp.role}
                    </h3>
                    <p className="text-xl md:text-2xl text-zinc-500 mb-6 font-medium" style={{ color: theme.accentColor }}>
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-lg md:text-xl text-zinc-600 leading-relaxed max-w-2xl">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="lg:col-span-5 flex flex-col gap-16 md:gap-24">
            
            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-10">
                  Superpowers
                </h2>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {skills.map((skill, i) => {
                    const rotations = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1"];
                    const rot = rotations[i % rotations.length];
                    return (
                      <span key={skill} className={`inline-block px-6 py-4 text-lg font-bold text-white bg-zinc-900 rounded-full transform ${rot} hover:rotate-0 hover:scale-110 hover:bg-zinc-800 transition-all duration-300 cursor-default shadow-lg`}>
                        {skill}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-10">
                  Education
                </h2>
                <div className="flex flex-col gap-8">
                  {educations.map((edu, i) => (
                    <div key={i} className="p-8 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-zinc-100">
                      <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2">{edu.institution}</h3>
                      {edu.degree && (
                        <p className="text-lg md:text-xl text-zinc-600 font-medium">{edu.degree}</p>
                      )}
                      <p className="mt-6 text-sm font-bold text-zinc-400 uppercase tracking-widest">
                        {edu.startYear} — {edu.endYear || "PRESENT"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Contact */}
        <footer className="mt-24 md:mt-40 py-16 md:py-24 border-t-4 border-zinc-900">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
            <div>
              <h2 className="text-[5rem] sm:text-[7rem] md:text-[10rem] font-black uppercase tracking-tighter leading-none mb-8 text-zinc-900">
                Let&apos;s <br/> Talk.
              </h2>
              <div className="flex flex-col gap-4 text-2xl md:text-4xl font-medium text-zinc-500">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="hover:text-zinc-900 transition-colors underline decoration-zinc-300 hover:decoration-zinc-900 underline-offset-8 w-fit">
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <span className="w-fit">{contact.phone}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 md:gap-6">
              {socials.map((social, i) => (
                <a key={i} href={social.url} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-white hover:scale-110 hover:-rotate-12 transition-all duration-300 shadow-sm">
                  <SocialIcon platform={social.platform} size={32} />
                </a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
