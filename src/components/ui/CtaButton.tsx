import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export function CtaButton({
  label,
  href,
  variant = "primary",
}: {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
        isPrimary
          ? "bg-ink text-white hover:bg-black"
          : "bg-surface text-ink ring-1 ring-black/10 hover:ring-black/20"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 ${
          isPrimary ? "bg-white/15" : "bg-black/5"
        }`}
      >
        <ArrowUpRight size={16} weight="light" />
      </span>
    </a>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-max rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft ring-1 ring-black/5">
      {children}
    </span>
  );
}
