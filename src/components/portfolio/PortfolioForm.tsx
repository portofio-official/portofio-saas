"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAutosave } from "@/hooks/useAutosave";
import { savePortfolioDataAction } from "@/lib/portfolio/actions";
import type { PortfolioData } from "@/lib/portfolio/types";
import { Eyebrow } from "@/components/ui/CtaButton";
import { ProfileSection } from "@/components/portfolio/sections/ProfileSection";
import { ExperienceSection } from "@/components/portfolio/sections/ExperienceSection";
import { EducationSection } from "@/components/portfolio/sections/EducationSection";
import { SkillsSection } from "@/components/portfolio/sections/SkillsSection";
import { ProjectsSection } from "@/components/portfolio/sections/ProjectsSection";
import { ContactSection } from "@/components/portfolio/sections/ContactSection";
import { SocialsSection } from "@/components/portfolio/sections/SocialsSection";

export function PortfolioForm({ initialData }: { initialData: PortfolioData }) {
  const [data, setData] = useState(initialData);
  const status = useAutosave(data, savePortfolioDataAction);

  const t = useTranslations("PortfolioForm");
  const tProfile = useTranslations("PortfolioForm.profile");
  const tExperience = useTranslations("PortfolioForm.experience");
  const tEducation = useTranslations("PortfolioForm.education");
  const tSkills = useTranslations("PortfolioForm.skills");
  const tProjects = useTranslations("PortfolioForm.projects");
  const tContact = useTranslations("PortfolioForm.contact");
  const tSocials = useTranslations("PortfolioForm.socials");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            {t("title")}
          </h1>
        </div>
        <span className="shrink-0 text-sm text-ink-soft">{t(`saveStatus.${status}`)}</span>
      </div>

      <ProfileSection
        t={tProfile}
        profile={data.profile}
        onChange={(patch) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }))}
      />
      <ExperienceSection
        t={tExperience}
        items={data.experiences}
        onChange={(experiences) => setData((d) => ({ ...d, experiences }))}
      />
      <EducationSection
        t={tEducation}
        items={data.educations}
        onChange={(educations) => setData((d) => ({ ...d, educations }))}
      />
      <SkillsSection
        eyebrow={tSkills("eyebrow")}
        title={tSkills("title")}
        placeholder={tSkills("placeholder")}
        removeLabel={tSkills("removeLabel")}
        skills={data.skills}
        onChange={(skills) => setData((d) => ({ ...d, skills }))}
      />
      <ProjectsSection
        t={tProjects}
        items={data.projects}
        onChange={(projects) => setData((d) => ({ ...d, projects }))}
      />
      <ContactSection
        t={tContact}
        contact={data.contact}
        onChange={(patch) => setData((d) => ({ ...d, contact: { ...d.contact, ...patch } }))}
      />
      <SocialsSection
        t={tSocials}
        items={data.socials}
        onChange={(socials) => setData((d) => ({ ...d, socials }))}
      />
    </div>
  );
}
