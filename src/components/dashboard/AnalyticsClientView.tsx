"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { AnalyticsRange, AnalyticsSite, AnalyticsSummary, DayBucket } from "@/lib/analytics";

const RANGES: { value: AnalyticsRange; labelKey: "range7d" | "range30d" | "rangeAll" }[] = [
  { value: "7d", labelKey: "range7d" },
  { value: "30d", labelKey: "range30d" },
  { value: "all", labelKey: "rangeAll" },
];

const DEVICE_KEYS: Record<string, "deviceDesktop" | "deviceMobile" | "deviceTablet" | "deviceOther"> = {
  desktop: "deviceDesktop",
  mobile: "deviceMobile",
  tablet: "deviceTablet",
  other: "deviceOther",
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

function TrendChart({ days, locale, label }: { days: DayBucket[]; locale: string; label: string }) {
  const W = 720;
  const H = 220;
  const PAD = 10;
  const BOTTOM = 28;

  if (!days.length) return null;

  const max = Math.max(1, ...days.map((d) => d.views));
  const innerW = W - PAD * 2;
  const innerH = H - PAD - BOTTOM;
  const stepX = days.length > 1 ? innerW / (days.length - 1) : 0;
  const x = (i: number) => PAD + i * stepX;
  const y = (v: number) => PAD + innerH * (1 - v / max);

  const line = days.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.views).toFixed(1)}`).join(" ");
  const area = `${line} L${x(days.length - 1).toFixed(1)},${(PAD + innerH).toFixed(1)} L${PAD},${(PAD + innerH).toFixed(1)} Z`;

  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" });
  const labelEvery = Math.max(1, Math.ceil(days.length / 5));
  const gridLines = [0.25, 0.5, 0.75].map((f) => PAD + innerH * (1 - f));

  return (
    <div className="mt-5 w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[200px] w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id="pv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((gy, i) => (
          <line
            key={i}
            x1={PAD}
            x2={W - PAD}
            y1={gy}
            y2={gy}
            stroke="var(--color-ink-faint)"
            strokeOpacity={0.2}
            strokeWidth={1}
            strokeDasharray="3 5"
          />
        ))}
        <path d={area} fill="url(#pv-area)" />
        <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {days.map((d, i) => (
          <circle key={d.date} cx={x(i)} cy={y(d.views)} r={3} fill="var(--color-accent)">
            <title>{`${fmt.format(new Date(`${d.date}T00:00:00Z`))} — ${d.views}`}</title>
          </circle>
        ))}
        {days.map((d, i) =>
          i % labelEvery === 0 ? (
            <text
              key={d.date}
              x={x(i)}
              y={H - 7}
              textAnchor="middle"
              fill="var(--color-ink-faint)"
              style={{ fontSize: 11, fontWeight: 500 }}
            >
              {fmt.format(new Date(`${d.date}T00:00:00Z`))}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}

function ProgressRow({ label, value, max, tone }: { label: React.ReactNode; value: number; max: number; tone?: boolean }) {
  const pct = max > 0 ? Math.max(3, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[12px] font-semibold text-ink-soft">{label}</span>
        <span className={`shrink-0 font-mono text-[12px] font-semibold tabular-nums ${tone ? "text-accent-deep" : "text-ink"}`}>
          {formatCount(value)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
        <div className={`h-full rounded-full transition-all duration-500 ${tone ? "bg-accent" : "bg-ink/20"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HeaderBlock({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="shrink-0 border-b border-black/5 bg-surface px-6 pt-6 pb-5 sm:px-8">
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-deep ring-1 ring-accent/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {eyebrow}
        </span>
        <h1 className="mt-2.5 font-display text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-1 text-sm font-medium text-ink-soft">{subtitle}</p>
      </div>
    </header>
  );
}

function BreakdownCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-accent-deep">{icon}</span>
        <p className="font-display text-[14px] font-bold text-ink">{title}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyMini({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="material-symbols-outlined text-[24px] text-ink-faint">bar_chart</span>
      <p className="text-[12px] font-medium text-ink-faint">{label}</p>
    </div>
  );
}

export function AnalyticsClientView({
  sites,
  selectedProjectId,
  range,
  summary,
}: {
  sites: AnalyticsSite[];
  selectedProjectId: string | null;
  range: AnalyticsRange;
  summary: AnalyticsSummary | null;
}) {
  const t = useTranslations("Analytics");
  const locale = useLocale();
  const router = useRouter();

  const selected = sites.find((s) => s.projectId === selectedProjectId) ?? sites[0] ?? null;
  const rangeLabel = t(RANGES.find((r) => r.value === range)?.labelKey ?? "range7d");

  const setRange = (r: AnalyticsRange) => {
    const siteParam = selected?.projectId ? `?site=${selected.projectId}&` : "?";
    router.push(`/dashboard/analytics${siteParam}range=${r}`);
  };
  const setSite = (id: string) => {
    router.push(`/dashboard/analytics?site=${id}&range=${range}`);
  };

  const region = new Intl.DisplayNames([locale], { type: "region" });

  if (!selected) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-surface select-none">
        <HeaderBlock eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="flex max-w-md flex-col items-center gap-3.5 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/[0.1] text-accent-deep ring-1 ring-accent/20">
              <span className="material-symbols-outlined text-[32px]">insights</span>
            </div>
            <p className="font-display text-[18px] font-bold text-ink">{t("noSiteTitle")}</p>
            <p className="text-[13px] font-medium text-ink-soft leading-relaxed">{t("noSiteDesc")}</p>
            <Link
              href="/dashboard"
              className="mt-2 group flex h-11 items-center gap-3 rounded-full bg-accent pl-5 pr-2.5 text-[13px] font-bold text-white shadow-[0_10px_28px_-8px_rgba(0,207,124,0.55)] transition-all duration-300 hover:bg-accent-deep hover:shadow-[0_14px_32px_-6px_rgba(0,207,124,0.65)] active:scale-[0.98]"
            >
              <span>{t("noSiteCta")}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/30">
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface select-none">
      <HeaderBlock eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      {/* Site switcher + range */}
      <div className="flex flex-col gap-3 border-b border-black/5 bg-surface px-6 pb-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="material-symbols-outlined text-[17px] text-ink-faint">web</span>
          {sites.map((s) => (
            <button
              key={s.projectId}
              type="button"
              onClick={() => setSite(s.projectId)}
              className={`flex h-9 items-center gap-2 rounded-full px-4 text-[12px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                s.projectId === selected.projectId
                  ? "bg-accent text-white shadow-[0_6px_18px_-6px_rgba(0,207,124,0.55)]"
                  : "bg-ink/[0.05] text-ink-soft ring-1 ring-black/5 hover:bg-ink/[0.08] hover:text-ink"
              }`}
            >
              <span className="max-w-[130px] truncate font-mono text-[11px]">{s.subdomain}.portofio.app</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] font-medium text-ink-faint">
            {t("siteLabel")}: <span className="font-semibold text-ink">{selected.subdomain}.portofio.app</span>
          </p>
          <div className="flex items-center gap-0.5 rounded-full bg-ink/[0.05] p-1 ring-1 ring-black/5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`h-7 rounded-full px-3.5 text-[12px] font-semibold transition-all duration-200 ${
                  range === r.value ? "bg-surface text-ink shadow-xs ring-1 ring-black/5" : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                {t(r.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto bg-shell/40 px-6 py-6 sm:px-8">
        {summary && summary.totalViews === 0 ? (
          <div className="flex items-start gap-3 rounded-2xl bg-accent/[0.08] p-4 ring-1 ring-accent/20">
            <span className="material-symbols-outlined mt-0.5 text-[18px] text-accent-deep">info</span>
            <div>
              <p className="font-display text-[13px] font-bold text-ink">{t("noDataTitle")}</p>
              <p className="mt-0.5 text-[12px] text-ink-soft">{t("noDataDesc")}</p>
            </div>
          </div>
        ) : null}

        {summary && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {[
                { label: t("statViews"), value: summary.totalViews, icon: "visibility", tone: true },
                { label: t("statVisitors"), value: summary.uniqueVisitors, icon: "groups" },
                { label: t("statToday"), value: summary.viewsToday, icon: "today" },
                { label: t("stat7d"), value: summary.views7d, icon: "monitoring" },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl bg-surface p-4.5 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-[20px] text-ink-faint">{card.icon}</span>
                    {card.tone ? (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-3 font-display text-[26px] font-bold leading-none tracking-tight tabular-nums ${card.tone ? "text-accent-deep" : "text-ink"}`}>
                    {formatCount(card.value)}
                  </p>
                  <p className="mt-1.5 text-[12px] font-medium text-ink-faint">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Trend chart */}
            {summary.perDay.length > 0 && (
              <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-[15px] font-bold text-ink">{t("chartTitle")}</p>
                    <p className="mt-0.5 text-[12px] text-ink-faint">{rangeLabel} · {t("chartViews").toLowerCase()}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent/[0.1] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-deep ring-1 ring-accent/20">
                    {t("chartViews")} · {formatCount(summary.totalViews)}
                  </span>
                </div>
                <TrendChart days={summary.perDay} locale={locale} label={t("chartTitle")} />
              </div>
            )}

            {/* Section engagement + performance */}
            {summary.sectionEngagement && (
              <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
                <div className="mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent-deep">donut_small</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15px] font-bold text-ink">{t("perfSectionTitle")}</p>
                    <p className="text-[12px] text-ink-faint">{t("perfSectionDesc")}</p>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-3.5">
                  <div className="rounded-xl bg-shell/70 p-4 ring-1 ring-black/5">
                    <p className="font-display text-[24px] font-bold leading-none tabular-nums text-accent-deep">
                      {summary.sectionEngagement.avgSections.toLocaleString(locale)}
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium leading-tight text-ink-faint">{t("avgSections")}</p>
                  </div>
                  <div className="rounded-xl bg-shell/70 p-4 ring-1 ring-black/5">
                    <p className="font-display text-[24px] font-bold leading-none tabular-nums text-ink">
                      {summary.sectionEngagement.engagedRate}%
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium leading-tight text-ink-faint">{t("engagedRate")}</p>
                  </div>
                  <div className="rounded-xl bg-shell/70 p-4 ring-1 ring-black/5">
                    <p className="font-display text-[24px] font-bold leading-none tabular-nums text-ink">
                      {formatCount(summary.sectionEngagement.deepVisitors)}
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium leading-tight text-ink-faint">{t("deepVisitors")}</p>
                  </div>
                </div>

                {summary.sectionEngagement.sections.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {summary.sectionEngagement.sections.map((s) => (
                      <div key={s.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-[13px] font-semibold text-ink">{s.label}</span>
                          <span className="shrink-0 text-[11px] font-medium tabular-nums text-ink-faint">
                            {formatCount(s.views)} {t("sectionViews")} · {formatCount(s.visitors)} {t("sectionVisitors")} ·{" "}
                            <span className="font-semibold text-accent-deep">{s.share}%</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
                          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.min(100, Math.max(3, s.share))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyMini label={t("sectionsEmpty")} />
                )}
              </div>
            )}

            {/* Breakdowns */}
            <div className="grid gap-4 lg:grid-cols-2">
              <BreakdownCard title={t("topPagesTitle")} icon="route">
                {summary.topPages.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {summary.topPages.map((p) => (
                      <ProgressRow key={p.path} label={p.path} value={p.views} max={summary.topPages[0].views} tone />
                    ))}
                  </div>
                ) : (
                  <EmptyMini label={t("topPagesEmpty")} />
                )}
              </BreakdownCard>

              <BreakdownCard title={t("topReferrersTitle")} icon="link">
                {summary.topReferrers.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {summary.topReferrers.map((r) => (
                      <ProgressRow key={r.host ?? "direct"} label={r.host ?? t("direct")} value={r.views} max={summary.topReferrers[0].views} />
                    ))}
                  </div>
                ) : (
                  <EmptyMini label={t("topReferrersEmpty")} />
                )}
              </BreakdownCard>

              <BreakdownCard title={t("devicesTitle")} icon="devices">
                {summary.devices.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {summary.devices.map((d) => (
                      <ProgressRow key={d.device} label={t(DEVICE_KEYS[d.device] ?? "deviceOther")} value={d.views} max={summary.devices[0].views} />
                    ))}
                  </div>
                ) : (
                  <EmptyMini label={t("noDataTitle")} />
                )}
              </BreakdownCard>

              <BreakdownCard title={t("browsersTitle")} icon="language">
                {summary.browsers.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {summary.browsers.map((b) => (
                      <ProgressRow
                        key={b.browser ?? "unknown"}
                        label={b.browser ?? t("browserUnknown")}
                        value={b.views}
                        max={summary.browsers[0].views}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyMini label={t("noDataTitle")} />
                )}
              </BreakdownCard>
            </div>

            {/* Countries */}
            {summary.countries.length > 0 ? (
              <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent-deep">public</span>
                  <p className="font-display text-[15px] font-bold text-ink">{t("countriesTitle")}</p>
                </div>
                <div className="flex flex-col gap-4">
                  {summary.countries.map((c) => (
                    <ProgressRow
                      key={c.country ?? "unknown"}
                      label={c.country ? region.of(c.country) ?? c.country : t("countryUnknown")}
                      value={c.views}
                      max={summary.countries[0].views}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}

        {!summary && (
          <p className="text-[13px] font-medium text-ink-faint">{t("unknownError")}</p>
        )}
      </div>
    </div>
  );
}