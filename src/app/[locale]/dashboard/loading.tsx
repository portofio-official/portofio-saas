export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 sm:px-8 pt-6 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-4">
          <div className="min-w-0">
            <div className="h-5 w-24 animate-pulse rounded-full bg-ink/[0.06]" />
            <div className="mt-2.5 h-7 w-40 animate-pulse rounded-full bg-ink/[0.06]" />
            <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded-full bg-ink/[0.05]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-full bg-ink/[0.06]" />
            <div className="h-9 w-16 animate-pulse rounded-full bg-ink/[0.06]" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-accent/20" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              <div className="h-[220px] sm:h-[240px] w-full animate-pulse rounded-2xl bg-ink/[0.05] ring-1 ring-black/5" />
              <div className="space-y-1.5 px-1">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-ink/[0.06]" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-ink/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
