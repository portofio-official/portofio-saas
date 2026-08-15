import type { BasePortfolioData } from "@/templates/shared/_base";
import type { StudioData } from "@/templates/definitions/studio/schema";
import type { PortfolioProData } from "@/templates/definitions/portfolio-pro/schema";
import type { FreelancerData } from "@/templates/definitions/freelancer/schema";
import type { WebsiteDocument } from "@/templates/definition";

// `studio` and `portfolio-pro` both declare a `hero` field with incompatible
// shapes, so a plain `Partial<StudioData> & Partial<PortfolioProData>`
// intersection is unsatisfiable — union the one field that collides instead.
export type EditorData = BasePortfolioData &
  Partial<Omit<StudioData, "hero">> &
  Partial<Omit<PortfolioProData, "hero">> &
  Partial<
    Omit<
      FreelancerData,
      "profile" | "contact" | "socials" | "theme" | "skills" | "projects" | "testimonials"
    >
  > & {
    hero?: StudioData["hero"] | PortfolioProData["hero"];
  };

export type ReadinessIssue = {
  id: string;
  label: string;
  detail: string;
};

export type VersionListItem = {
  id: string;
  versionNumber: number;
  createdAt: string;
  isAutosave: boolean;
};

export type PreviewDevice = "desktop" | "laptop" | "tablet" | "mobile";
export type PreviewZoom = "fit-screen" | "25" | "50" | "100";

export const DEVICE_CONFIG: Record<PreviewDevice, { width: number; height: number; name: string }> = {
  desktop: { width: 1440, height: 900, name: "Desktop" },
  laptop: { width: 1280, height: 800, name: "Laptop" },
  tablet: { width: 768, height: 1024, name: "Tablet" },
  mobile: { width: 390, height: 844, name: "Mobile" },
};

export type EditorProps = {
  projectId: string;
  workspaceId?: string;
  initialDocument: WebsiteDocument;
  initialPublishedDocument?: WebsiteDocument | null;
  initialTemplateId: string;
  initialSubdomain?: string | null;
  initialStatus?: "draft" | "published";
  profileDiverged?: boolean;
  rootDomain?: string;
};
