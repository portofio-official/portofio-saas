export type AnalyticsRange = "7d" | "30d" | "all";

export interface AnalyticsSite {
  projectId: string;
  subdomain: string;
  workspaceName: string;
  projectName: string;
}

export interface DayBucket {
  date: string; // ISO yyyy-mm-dd (UTC)
  views: number;
  visitors: number;
}

export interface SectionPerformance {
  key: string;
  label: string;
  views: number;
  visitors: number;
  share: number; // % of page unique visitors who reached this section
}

export interface SectionEngagement {
  avgSections: number; // average distinct sections per engaged visitor
  engagedVisitors: number; // distinct visitors who reached at least one section
  engagedRate: number; // % of page unique visitors who reached any section
  deepVisitors: number; // distinct visitors who reached 2+ different sections
  sections: SectionPerformance[];
}

export interface AnalyticsSummary {
  range: AnalyticsRange;
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  views7d: number;
  views30d: number;
  // Baseline from the preceding equal-length window (for KPI trend deltas).
  prevViews: number;
  prevVisitors: number;
  perDay: DayBucket[];
  topPages: { path: string; views: number; visitors: number }[];
  topReferrers: { host: string | null; views: number; visitors: number }[];
  devices: { device: string; views: number; visitors: number }[];
  browsers: { browser: string | null; views: number }[];
  countries: { country: string | null; views: number; visitors: number }[];
  sectionEngagement: SectionEngagement | null;
}