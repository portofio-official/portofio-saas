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

export interface AnalyticsSummary {
  range: AnalyticsRange;
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  views7d: number;
  views30d: number;
  perDay: DayBucket[];
  topPages: { path: string; views: number; visitors: number }[];
  topReferrers: { host: string | null; views: number; visitors: number }[];
  devices: { device: string; views: number; visitors: number }[];
  browsers: { browser: string | null; views: number }[];
  countries: { country: string | null; views: number; visitors: number }[];
}