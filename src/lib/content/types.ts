// Content Library — reusable content cards (image + title + description
// + link) per account (user-scoped), ready to be resolved into any template's
// Projects/Testimonials/etc. sections. One global library per user, shared
// across all their workspaces.

export type ContentType = "project" | "testimonial" | "certificate" | "caseStudy" | "gallery";

export interface ContentItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  createdAt: string;
  updatedAt: string;
  contentType: ContentType;
  isActive: boolean;
  sortOrder: number;
  content: Record<string, unknown>;
}

export interface ContentItemInput {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  contentType?: ContentType;
  isActive?: boolean;
  content?: Record<string, unknown>;
}