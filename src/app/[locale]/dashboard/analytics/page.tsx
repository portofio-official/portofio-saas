import { getPublishedSites, getProjectAnalytics } from "@/lib/analytics/store";
import { AnalyticsClientView } from "@/components/dashboard/AnalyticsClientView";
import type { AnalyticsRange } from "@/lib/analytics/types";

function oneOf(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await params;
  const sp = await searchParams;

  const rawRange = oneOf(sp.range);
  const range: AnalyticsRange = rawRange === "30d" ? "30d" : rawRange === "all" ? "all" : "7d";

  // RLS-scoped to the signed-in account (the dashboard layout already gates auth).
  const sites = await getPublishedSites();
  const rawSite = oneOf(sp.site);
  const selectedId = sites.find((s) => s.projectId === rawSite)?.projectId ?? sites[0]?.projectId ?? null;

  const summary = selectedId ? await getProjectAnalytics(selectedId, range) : null;

  return (
    <AnalyticsClientView
      sites={sites}
      selectedProjectId={selectedId}
      range={range}
      summary={summary}
    />
  );
}