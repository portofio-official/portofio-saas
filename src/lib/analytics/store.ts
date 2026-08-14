import { createClient } from "@/lib/supabase/server";
import type { AnalyticsRange, AnalyticsSite, AnalyticsSummary, DayBucket, SectionEngagement } from "./types";
import { requireRole } from "@/lib/auth/roles";

const DAY_MS = 86_400_000;

// Bounded per-range fetches: enough for a lightweight visitor dashboard without
// pulling entire visit logs (the "all" range is capped at the latest 5 000 hits).
const RANGE_META: Record<AnalyticsRange, { days: number; limit: number }> = {
  "7d": { days: 7, limit: 2000 },
  "30d": { days: 30, limit: 3000 },
  all: { days: 365, limit: 5000 },
};

interface VisitRow {
  visitor_hash: string | null;
  page_path: string;
  referrer_host: string | null;
  device_type: string | null;
  browser: string | null;
  country_code: string | null;
  created_at: string;
}

// RLS (page_visits_owner_all, to authenticated) restricts reads to the caller's
// own published projects — no manual ownership filter needed.
export async function getPublishedSites(): Promise<AnalyticsSite[]> {
  await requireRole(["user", "designer"]);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, subdomain, name, workspaces(name)")
    .eq("status", "published")
    .not("subdomain", "is", null)
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    projectId: row.id as string,
    subdomain: row.subdomain as string,
    workspaceName: (row as unknown as { workspaces: { name: string }[] }).workspaces?.[0]?.name ?? "",
    projectName: (row.name as string) ?? "",
  }));
}

export async function getProjectAnalytics(
  projectId: string,
  range: AnalyticsRange
): Promise<AnalyticsSummary | null> {
  await requireRole(["user", "designer"]);
  const supabase = await createClient();
  const meta = RANGE_META[range];
  const now = Date.now();
  const start = new Date(now - (meta.days - 1) * DAY_MS);
  start.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("page_visits")
    .select("visitor_hash, page_path, referrer_host, device_type, browser, country_code, created_at")
    .eq("project_id", projectId)
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: false })
    .limit(meta.limit);

  if (error || !data) return null;

  // Bots may execute the beacon; exclude them from every aggregate.
  const rows = (data as unknown as VisitRow[]).filter((r) => r.device_type !== "bot");
  const summary = aggregate(rows, range, meta.days, start);

  // Baseline for trend deltas: count views + distinct visitors over the
  // immediately preceding equal-length window (the same-day relative range
  // always maps cleanly because "all" reuses a 365-day window).
  const prevStart = new Date(start.getTime() - meta.days * DAY_MS);
  const { data: prevRows } = await supabase
    .from("page_visits")
    .select("visitor_hash, device_type, created_at")
    .eq("project_id", projectId)
    .gte("created_at", prevStart.toISOString())
    .lt("created_at", start.toISOString())
    .order("created_at", { ascending: false })
    .limit(meta.limit);
  const prevHuman = (prevRows as unknown as { visitor_hash: string | null; device_type: string | null }[] | null)
    ?.filter((r) => r.device_type !== "bot") ?? [];
  const prevVisitors = new Set<string>();
  for (const r of prevHuman) if (r.visitor_hash) prevVisitors.add(r.visitor_hash);
  summary.prevViews = prevHuman.length;
  summary.prevVisitors = prevVisitors.size;

  summary.sectionEngagement = await getSectionEngagement(
    supabase,
    projectId,
    start.toISOString(),
    summary.uniqueVisitors
  );
  return summary;
}

// Section engagement -----------------------------------------------------------

export async function getRecentViewsByWorkspace(
  workspaceIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (workspaceIds.length === 0) return map;

  await requireRole(["user", "designer"]);
  const supabase = await createClient();
  const start = new Date(Date.now() - 6 * DAY_MS);
  start.setUTCHours(0, 0, 0, 0);

  const { data: projectRows } = await supabase
    .from("projects")
    .select("id, workspace_id")
    .in("workspace_id", workspaceIds);

  if (!projectRows) return map;
  const projectIds = projectRows.map((p) => p.id as string);
  if (projectIds.length === 0) return map;

  const workspaceByProject = new Map<string, string>();
  for (const p of projectRows) workspaceByProject.set(p.id as string, p.workspace_id as string);

  const { data: visitRows } = await supabase
    .from("page_visits")
    .select("project_id")
    .in("project_id", projectIds)
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: false })
    .limit(3000);

  if (!visitRows) return map;
  for (const v of visitRows) {
    const wid = workspaceByProject.get(v.project_id as string);
    if (wid) map.set(wid, (map.get(wid) ?? 0) + 1);
  }
  return map;
}

interface SectionRow {
  visitor_hash: string | null;
  section_key: string;
  section_label: string | null;
  device_type: string | null;
}

async function getSectionEngagement(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  startIso: string,
  pageVisitors: number
): Promise<SectionEngagement | null> {
  const { data, error } = await supabase
    .from("section_visits")
    .select("visitor_hash, section_key, section_label, device_type")
    .eq("project_id", projectId)
    .gte("created_at", startIso)
    .order("created_at", { ascending: false })
    .limit(4000);

  if (error || !data) return null;

  // Bots may execute the beacon; exclude them from every aggregate.
  const rows = (data as unknown as SectionRow[]).filter(
    (r) => r.device_type !== "bot" && !!r.visitor_hash && !!r.section_key
  );

  if (rows.length === 0) {
    return { avgSections: 0, engagedVisitors: 0, engagedRate: 0, deepVisitors: 0, sections: [] };
  }

  const byKey = new Map<string, { label: string; views: number; visitors: Set<string> }>();
  const perVisitor = new Map<string, Set<string>>();

  for (const r of rows) {
    const visitor = r.visitor_hash!;
    let v = perVisitor.get(visitor);
    if (!v) {
      v = new Set<string>();
      perVisitor.set(visitor, v);
    }
    v.add(r.section_key);

    let g = byKey.get(r.section_key);
    if (!g) {
      g = { label: r.section_label || r.section_key, views: 0, visitors: new Set<string>() };
      byKey.set(r.section_key, g);
    }
    g.views += 1;
    g.visitors.add(visitor);
  }

  let totalDistinct = 0;
  let deep = 0;
  for (const set of perVisitor.values()) {
    totalDistinct += set.size;
    if (set.size >= 2) deep += 1;
  }

  const sections = [...byKey.entries()]
    .map(([key, g]) => ({
      key,
      label: g.label || key,
      views: g.views,
      visitors: g.visitors.size,
      share: pageVisitors > 0 ? Math.round((g.visitors.size / pageVisitors) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return {
    avgSections: perVisitor.size > 0 ? Math.round((totalDistinct / perVisitor.size) * 10) / 10 : 0,
    engagedVisitors: perVisitor.size,
    engagedRate: pageVisitors > 0 ? Math.round((perVisitor.size / pageVisitors) * 100) : 0,
    deepVisitors: deep,
    sections,
  };
}

// ---------------------------------------------------------------------------

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function buildPerDay(rows: VisitRow[], range: AnalyticsRange, days: number, start: Date): DayBucket[] {
  // Bucket the available rows by UTC day, including days with zero visits.
  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (const r of rows) {
    const key = dayKey(r.created_at);
    let b = byDay.get(key);
    if (!b) {
      b = { views: 0, visitors: new Set<string>() };
      byDay.set(key, b);
    }
    b.views += 1;
    if (r.visitor_hash) b.visitors.add(r.visitor_hash);
  }

  // For "all" we down-sample to a ~40 point view so the SVG stays readable.
  const windowDays = range === "all" ? Math.min(days, 40) : days;
  const step = range === "all" ? Math.max(1, Math.round(days / 40)) : 1;

  const out: DayBucket[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < windowDays; i++) {
    const key = cursor.toISOString().slice(0, 10);
    let views = 0;
    const visitors = new Set<string>();
    for (let s = 0; s < step; s++) {
      const b = byDay.get(key);
      if (b) {
        views += b.views;
        for (const v of b.visitors) visitors.add(v);
      }
    }
    out.push({ date: key, views, visitors: visitors.size });
    cursor.setTime(cursor.getTime() + step * DAY_MS);
  }
  return out;
}

interface Group {
  key: string | null;
  views: number;
  visitors: number;
}

function topGrouped(
  rows: VisitRow[],
  pick: (r: VisitRow) => string | null,
  limit: number
): Group[] {
  const map = new Map<string | null, { views: number; visitors: Set<string> }>();
  for (const r of rows) {
    const key = pick(r);
    let g = map.get(key);
    if (!g) {
      g = { views: 0, visitors: new Set<string>() };
      map.set(key, g);
    }
    g.views += 1;
    if (r.visitor_hash) g.visitors.add(r.visitor_hash);
  }
  return [...map.entries()]
    .map(([key, g]) => ({ key, views: g.views, visitors: g.visitors.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

function aggregate(rows: VisitRow[], range: AnalyticsRange, days: number, start: Date): AnalyticsSummary {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const weekStart = Date.now() - 7 * DAY_MS;
  const monthStart = Date.now() - 30 * DAY_MS;

  const human = rows; // bots already filtered by the caller
  const visitorSet = new Set<string>();
  for (const r of human) {
    if (r.visitor_hash) visitorSet.add(r.visitor_hash);
  }

  return {
    range,
    totalViews: human.length,
    uniqueVisitors: visitorSet.size,
    viewsToday: human.filter((r) => new Date(r.created_at) >= todayStart).length,
    views7d: human.filter((r) => new Date(r.created_at).getTime() >= weekStart).length,
    views30d: human.filter((r) => new Date(r.created_at).getTime() >= monthStart).length,
    prevViews: 0,
    prevVisitors: 0,
    perDay: buildPerDay(human, range, days, start),
    sectionEngagement: null,
    topPages: topGrouped(human, (r) => r.page_path || "/", 6).map((g) => ({
      path: g.key ?? "/",
      views: g.views,
      visitors: g.visitors,
    })),
    topReferrers: topGrouped(human, (r) => r.referrer_host ?? null, 6).map((g) => ({
      host: g.key,
      views: g.views,
      visitors: g.visitors,
    })),
    devices: topGrouped(human, (r) => r.device_type ?? "other", 6).map((g) => ({
      device: g.key ?? "other",
      views: g.views,
      visitors: g.visitors,
    })),
    browsers: topGrouped(human, (r) => r.browser ?? null, 6).map((g) => ({
      browser: g.key,
      views: g.views,
    })),
    countries: topGrouped(human, (r) => r.country_code ?? null, 8).map((g) => ({
      country: g.key,
      views: g.views,
      visitors: g.visitors,
    })),
  };
}
