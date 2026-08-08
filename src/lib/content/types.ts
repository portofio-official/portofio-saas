// Content Library — reusable project cards (image + title + description
// + link) per workspace, ready to be inserted into a template's Projects
// section from the editor.

export interface ContentItem {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItemInput {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}