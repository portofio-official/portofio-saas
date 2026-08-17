export default function AdminLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 sm:px-8 pt-6 pb-5">
        <div className="min-w-0">
          <div className="h-5 w-20 animate-pulse rounded-full bg-ink/[0.06]" />
          <div className="mt-2.5 h-7 w-40 animate-pulse rounded-full bg-ink/[0.06]" />
          <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded-full bg-ink/[0.05]" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 py-3 sm:gap-6">
                <div className="h-4 w-full sm:w-40 animate-pulse rounded-full bg-ink/[0.06]" />
                <div className="h-4 w-32 sm:w-24 animate-pulse rounded-full bg-ink/[0.05]" />
                <div className="ml-auto h-7 w-28 animate-pulse rounded-full bg-accent/15" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}