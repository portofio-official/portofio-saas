import type { WebsiteDocument } from "@/templates/definition";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  templateId: string;
  templateVersion: number;
  currentVersionId: string | null;
  publishedVersionId: string | null;
  subdomain: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  profileSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  contentJson: WebsiteDocument;
  schemaVersion: number;
  isAutosave: boolean;
  createdAt: string;
  createdBy: string | null;
}

export interface ProjectWithDraft extends Project {
  draftVersion: ProjectVersion;
}

export type ProjectSummary = Pick<
  Project,
  "id" | "name" | "templateId" | "status" | "subdomain" | "updatedAt"
>;
