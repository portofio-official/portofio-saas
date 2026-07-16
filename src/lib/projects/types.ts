import type { WebsiteDocument } from "@/lib/templates/definition";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  templateId: string;
  templateVersion: number;
  draftJson: WebsiteDocument;
  publishedJson: WebsiteDocument | null;
  subdomain: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectSummary = Pick<
  Project,
  "id" | "name" | "templateId" | "status" | "subdomain" | "updatedAt"
>;
