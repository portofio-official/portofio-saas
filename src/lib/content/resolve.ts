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
      return base;
    });

  const next = { ...data };
  if ("projects" in next) next.projects = byType("project");
  if ("testimonials" in next) next.testimonials = byType("testimonial");
  if ("certificates" in next) next.certificates = byType("certificate");
  if ("caseStudies" in next) next.caseStudies = byType("caseStudy");
  if ("gallery" in next) next.gallery = byType("gallery");
  return next;
}
