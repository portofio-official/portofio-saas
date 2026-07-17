"use client";

import { RepeatableSection } from "@/components/portfolio/RepeatableSection";
import { FormPanel } from "@/components/ui/FormPanel";
import { FormField, FormTextarea } from "@/components/ui/FormField";
import { PhotoUploadField } from "@/components/portfolio/PhotoUploadField";
import type { PortfolioProData } from "@/components/templates/portfolio-pro/schema";

type SkillItem = PortfolioProData["skillsShowcase"][number];
type ExperienceItem = PortfolioProData["experienceDetails"][number];
type EducationItem = PortfolioProData["educationDetails"][number];
type CaseStudyItem = PortfolioProData["caseStudies"][number];
type CertificateItem = PortfolioProData["certificates"][number];
type GalleryItem = PortfolioProData["gallery"][number];

// "One per line" textarea for a string[] field — avoids a nested tag-editor per row.
function LinesField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <FormTextarea
      label={`${label} (one per line)`}
      rows={3}
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n").filter((line) => line.trim().length > 0))}
    />
  );
}

export function PortfolioProHeroSection({
  hero,
  onChange,
}: {
  hero: PortfolioProData["hero"];
  onChange: (patch: Partial<PortfolioProData["hero"]>) => void;
}) {
  const badges = hero?.badges ?? [];
  function updateBadge(i: number, patch: Partial<PortfolioProData["hero"]["badges"][number]>) {
    onChange({ badges: badges.map((b, bi) => (bi === i ? { ...b, ...patch } : b)) });
  }
  return (
    <FormPanel eyebrow="Portfolio Pro" title="Hero Section">
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-ink-faint">Name, role, location, bio and photo come from the Profile section below.</p>
        <FormField label="CV link (optional)" value={hero?.cvUrl ?? ""} onChange={(e) => onChange({ cvUrl: e.target.value || undefined })} />
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-ink-soft">Floating tech badges (up to 3, optional)</span>
          {badges.map((badge, i) => (
            <div key={i} className="flex items-end gap-3 rounded-xl bg-surface p-3 ring-1 ring-black/[0.07]">
              <PhotoUploadField label="Logo" value={badge.logoUrl} onChange={(v) => updateBadge(i, { logoUrl: v ?? "" })} uploadLabel="Upload" replaceLabel="Replace" />
              <FormField label="Label (optional)" value={badge.label ?? ""} onChange={(e) => updateBadge(i, { label: e.target.value || undefined })} />
              <button type="button" onClick={() => onChange({ badges: badges.filter((_, bi) => bi !== i) })} className="text-[13px] text-ink-soft hover:text-danger">
                Remove
              </button>
            </div>
          ))}
          {badges.length < 3 && (
            <button
              type="button"
              onClick={() => onChange({ badges: [...badges, { logoUrl: "" }] })}
              className="inline-flex w-max items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-black/[0.07]"
            >
              Add badge
            </button>
          )}
        </div>
      </div>
    </FormPanel>
  );
}

export function PortfolioProAboutSection({
  about,
  onChange,
}: {
  about: PortfolioProData["about"];
  onChange: (patch: Partial<PortfolioProData["about"]>) => void;
}) {
  return (
    <FormPanel eyebrow="Portfolio Pro" title="About Section">
      <div className="flex flex-col gap-4">
        <FormTextarea
          label="Paragraphs (one per line)"
          rows={4}
          value={about?.paragraphs.join("\n") ?? ""}
          onChange={(e) => onChange({ paragraphs: e.target.value.split("\n").filter((l) => l.trim().length > 0) })}
        />
        <FormField
          label="Focus tags, comma separated (e.g. Business Intelligence, Data Visualisation)"
          value={about?.tags.join(", ") ?? ""}
          onChange={(e) => onChange({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
        />
        <FormField
          label="Years of experience (optional)"
          type="number"
          min={0}
          value={about?.yearsExperience ?? ""}
          onChange={(e) => onChange({ yearsExperience: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </FormPanel>
  );
}

export function PortfolioProSkillsSection({ items, onChange }: { items: SkillItem[]; onChange: (items: SkillItem[]) => void }) {
  return (
    <RepeatableSection<SkillItem>
      eyebrow="Portfolio Pro"
      title="Skills"
      items={items}
      onChange={onChange}
      newItem={() => ({ name: "" })}
      addLabel="Add skill"
      removeLabel="Remove"
      renderRow={(item, update) => (
        <>
          <FormField label="Name" value={item.name} onChange={(e) => update({ name: e.target.value })} />
          <PhotoUploadField label="Logo (optional)" value={item.logoUrl} onChange={(v) => update({ logoUrl: v })} uploadLabel="Upload logo" replaceLabel="Replace logo" />
        </>
      )}
    />
  );
}

export function PortfolioProExperienceSection({ items, onChange }: { items: ExperienceItem[]; onChange: (items: ExperienceItem[]) => void }) {
  return (
    <RepeatableSection<ExperienceItem>
      eyebrow="Portfolio Pro"
      title="Experience"
      items={items}
      onChange={onChange}
      newItem={() => ({ company: "", role: "", period: "", achievements: [], tools: [] })}
      addLabel="Add experience"
      removeLabel="Remove"
      renderRow={(item, update) => (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Role" value={item.role} onChange={(e) => update({ role: e.target.value })} />
            <FormField label="Company" value={item.company} onChange={(e) => update({ company: e.target.value })} />
          </div>
          <FormField label="Period (e.g. Jan 2023 - Sekarang)" value={item.period} onChange={(e) => update({ period: e.target.value })} />
          <PhotoUploadField label="Company logo (optional)" value={item.logoUrl} onChange={(v) => update({ logoUrl: v })} uploadLabel="Upload logo" replaceLabel="Replace logo" />
          <LinesField label="Achievements" value={item.achievements} onChange={(v) => update({ achievements: v })} />
          <LinesField label="Tools" value={item.tools} onChange={(v) => update({ tools: v })} />
        </>
      )}
    />
  );
}

export function PortfolioProEducationSection({ items, onChange }: { items: EducationItem[]; onChange: (items: EducationItem[]) => void }) {
  return (
    <RepeatableSection<EducationItem>
      eyebrow="Portfolio Pro"
      title="Education"
      items={items}
      onChange={onChange}
      newItem={() => ({ institution: "", period: "", achievements: [] })}
      addLabel="Add education"
      removeLabel="Remove"
      renderRow={(item, update) => (
        <>
          <FormField label="Institution" value={item.institution} onChange={(e) => update({ institution: e.target.value })} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Degree (optional)" value={item.degree ?? ""} onChange={(e) => update({ degree: e.target.value || undefined })} />
            <FormField label="Period (e.g. 2017 - 2022)" value={item.period} onChange={(e) => update({ period: e.target.value })} />
          </div>
          <FormField label="GPA (optional)" value={item.gpa ?? ""} onChange={(e) => update({ gpa: e.target.value || undefined })} />
          <PhotoUploadField label="Institution logo (optional)" value={item.logoUrl} onChange={(v) => update({ logoUrl: v })} uploadLabel="Upload logo" replaceLabel="Replace logo" />
          <LinesField label="Achievements" value={item.achievements} onChange={(v) => update({ achievements: v })} />
        </>
      )}
    />
  );
}

function CaseStudyImages({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-ink-soft">Images</span>
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <div key={i} className="flex items-center gap-3">
            <PhotoUploadField
              label={`Image ${i + 1}`}
              value={img}
              onChange={(v) => onChange(images.map((im, ii) => (ii === i ? (v ?? "") : im)))}
              uploadLabel="Upload"
              replaceLabel="Replace"
            />
            <button type="button" onClick={() => onChange(images.filter((_, ii) => ii !== i))} className="text-[13px] text-ink-soft hover:text-danger">
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...images, ""])}
        className="inline-flex w-max items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-black/[0.07]"
      >
        Add image
      </button>
    </div>
  );
}

export function PortfolioProCaseStudiesSection({ items, onChange }: { items: CaseStudyItem[]; onChange: (items: CaseStudyItem[]) => void }) {
  return (
    <RepeatableSection<CaseStudyItem>
      eyebrow="Portfolio Pro"
      title="Case Studies"
      items={items}
      onChange={onChange}
      newItem={() => ({ title: "", images: [], achievements: [], tech: [], confidential: false })}
      addLabel="Add case study"
      removeLabel="Remove"
      renderRow={(item, update) => (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Title" value={item.title} onChange={(e) => update({ title: e.target.value })} />
            <FormField label="Category (optional)" value={item.category ?? ""} onChange={(e) => update({ category: e.target.value || undefined })} />
          </div>
          <FormField label="Date (optional, e.g. Mar 2024)" value={item.date ?? ""} onChange={(e) => update({ date: e.target.value || undefined })} />
          <FormTextarea label="Description" rows={3} value={item.description ?? ""} onChange={(e) => update({ description: e.target.value || undefined })} />
          <LinesField label="Achievements / Impact" value={item.achievements} onChange={(v) => update({ achievements: v })} />
          <LinesField label="Tech / tools used" value={item.tech} onChange={(v) => update({ tech: v })} />
          <label className="flex items-center gap-2 text-[13px] font-medium text-ink-soft">
            <input type="checkbox" checked={item.confidential} onChange={(e) => update({ confidential: e.target.checked })} />
            Confidential (shows a &quot;Limited Access&quot; badge instead of full details)
          </label>
          <FormField label="External link (optional)" value={item.link ?? ""} onChange={(e) => update({ link: e.target.value || undefined })} />
          <CaseStudyImages images={item.images} onChange={(images) => update({ images })} />
        </>
      )}
    />
  );
}

export function PortfolioProCertificatesSection({ items, onChange }: { items: CertificateItem[]; onChange: (items: CertificateItem[]) => void }) {
  return (
    <RepeatableSection<CertificateItem>
      eyebrow="Portfolio Pro"
      title="Certificates"
      items={items}
      onChange={onChange}
      newItem={() => ({ title: "" })}
      addLabel="Add certificate"
      removeLabel="Remove"
      renderRow={(item, update) => (
        <>
          <FormField label="Title" value={item.title} onChange={(e) => update({ title: e.target.value })} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Issuer (optional)" value={item.issuer ?? ""} onChange={(e) => update({ issuer: e.target.value || undefined })} />
            <FormField label="Date (optional, e.g. Mar 2023)" value={item.date ?? ""} onChange={(e) => update({ date: e.target.value || undefined })} />
          </div>
          <PhotoUploadField label="Certificate image" value={item.imageUrl} onChange={(v) => update({ imageUrl: v })} uploadLabel="Upload" replaceLabel="Replace" />
        </>
      )}
    />
  );
}

export function PortfolioProGallerySection({ items, onChange }: { items: GalleryItem[]; onChange: (items: GalleryItem[]) => void }) {
  return (
    <RepeatableSection<GalleryItem>
      eyebrow="Portfolio Pro"
      title="Gallery"
      items={items}
      onChange={onChange}
      newItem={() => ({ imageUrl: "" })}
      addLabel="Add photo"
      removeLabel="Remove"
      renderRow={(item, update) => (
        <>
          <PhotoUploadField label="Photo" value={item.imageUrl} onChange={(v) => update({ imageUrl: v ?? "" })} uploadLabel="Upload" replaceLabel="Replace" />
          <FormField label="Title (optional)" value={item.title ?? ""} onChange={(e) => update({ title: e.target.value || undefined })} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Location (optional)" value={item.location ?? ""} onChange={(e) => update({ location: e.target.value || undefined })} />
            <FormField label="Date (optional)" value={item.date ?? ""} onChange={(e) => update({ date: e.target.value || undefined })} />
          </div>
          <FormTextarea label="Description (optional)" rows={2} value={item.description ?? ""} onChange={(e) => update({ description: e.target.value || undefined })} />
        </>
      )}
    />
  );
}
