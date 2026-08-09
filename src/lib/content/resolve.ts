import type { ContentItem } from "./types";

export function resolveLibraryData(
  data: Record<string, unknown>,
  items: ContentItem[],
): Record<string, unknown> {
  const active = items
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const byType = (type: ContentItem["contentType"]) => active
    .filter((item) => item.contentType === type)
    .map((item) => {
      const base = { ...item.content, title: item.title, description: item.description, imageUrl: item.imageUrl, link: item.link };
      if (type === "testimonial") return { ...base, name: item.title, quote: item.description, body: item.description };
      if (type === "certificate") return { ...base, issuer: String(item.content.issuer ?? ""), date: String(item.content.date ?? "") };
      if (type === "caseStudy") return { ...base, images: item.imageUrl ? [item.imageUrl] : [], achievements: item.content.achievements ?? [], tech: item.content.tech ?? [] };
      if (type === "experience") return { ...base, company: String(item.content.company ?? ""), role: String(item.content.role ?? ""), startDate: String(item.content.startDate ?? ""), endDate: String(item.content.endDate ?? "") };
      if (type === "education") return { ...base, institution: String(item.content.institution ?? ""), degree: String(item.content.degree ?? ""), field: String(item.content.field ?? ""), startYear: item.content.startYear, endYear: item.content.endYear };
      if (type === "media") return { ...base, location: String(item.content.location ?? ""), date: String(item.content.date ?? "") };
      return base;
    });

  const next = { ...data };
  if ("projects" in next) next.projects = byType("project");
  if ("testimonials" in next) next.testimonials = byType("testimonial");
  if ("certificates" in next) next.certificates = byType("certificate");
  if ("caseStudies" in next) next.caseStudies = byType("caseStudy");
  if ("gallery" in next) next.gallery = byType("gallery");
  if ("experiences" in next) next.experiences = byType("experience");
  if ("educations" in next) next.educations = byType("education");
  return next;
}
