export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-max rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft ring-1 ring-black/5">
      {children}
    </span>
  );
}
