export type SubmissionStatus =
  | "draft"
  | "pending"
  | "revision_requested"
  | "approved"
  | "rejected";

export type IntegrationStatus = "not_started" | "in_review" | "merged" | "failed";

export type TemplateSubmission = {
  id: string;
  designerId: string;
  name: string;
  description: string;
  previewUrl: string;
  previewMobileUrl: string;
  sourcePath: string | null;
  sourceFilename: string | null;
  sourceSizeBytes: number | null;
  category: string | null;
  tags: string[];
  licenseName: string;
  status: SubmissionStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  registryId: string | null;
  integrationStatus: IntegrationStatus;
  integrationNotes: string | null;
  integratedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TemplateSubmissionInput = {
  name: string;
  description: string;
  previewUrl: string;
  previewMobileUrl: string;
  category: string;
  tags: string[];
  licenseName: string;
};
