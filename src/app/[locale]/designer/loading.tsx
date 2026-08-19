export default function DesignerLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface" aria-label="Loading Designer Portal" role="status">
      <div className="shrink-0 border-b border-black/5 px-6 pb-5 pt-6 sm:px-8">
        <div className="h-5 w-32 animate-pulse rounded-full bg-ink/[0.08]" />
        <div className="mt-3 h-8 w-72 max-w-full animate-pulse rounded-lg bg-ink/[0.08]" />
        <div className="mt-2 h-4 w-[28rem] max-w-full animate-pulse rounded bg-ink/[0.06]" />
      </div>
      <div className="flex-1 space-y-8 overflow-y-auto p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-ink/[0.05]" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-ink/[0.05]" />
      </div>
    </div>
  );
}
