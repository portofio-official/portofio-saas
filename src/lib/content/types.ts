// Content Library — reusable project cards (image + title + description
// + link) per workspace, ready to be inserted into a template's Projects
// section from the editor.

export type ContentType = "project" | "testimonial" | "certificate" | "caseStudy" | "gallery";

export interface ContentItem {
  id: string;
  workspaceId: string;
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
