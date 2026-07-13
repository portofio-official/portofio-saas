// Contract shared by the form (data-001), the 5 templates (template-001), and
// public rendering (publish-001). See PRD 9.4.
export interface PortfolioData {
  profile: {
    fullName: string;
    headline: string;
    bio: string;
    photoUrl?: string;
    location?: string;
  };
  experiences: {
    company: string;
    role: string;
    startDate: string; // "YYYY-MM"
    endDate?: string;
    description?: string;
  }[];
  educations: {
    institution: string;
    degree?: string;
    field?: string;
    startYear: number;
    endYear?: number;
  }[];
  skills: string[];
  projects: {
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
  }[];
  contact: {
    email: string;
    phone?: string;
    whatsapp?: string;
  };
  socials: {
    platform: "linkedin" | "github" | "instagram" | "x" | "youtube" | "tiktok" | "website";
    url: string;
  }[];
  theme: {
    accentColor: string;
    font: string;
  };
}

export const EMPTY_PORTFOLIO_DATA: PortfolioData = {
  profile: { fullName: "", headline: "", bio: "" },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
  contact: { email: "" },
  socials: [],
  theme: { accentColor: "#3532E5", font: "sans" },
};

export const SOCIAL_PLATFORMS = [
  "linkedin",
  "github",
  "instagram",
  "x",
  "youtube",
  "tiktok",
  "website",
] as const;
