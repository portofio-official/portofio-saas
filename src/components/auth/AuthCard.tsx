import { Eyebrow } from "@/components/ui/CtaButton";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
          <div className="flex flex-col gap-6 rounded-[calc(2rem-0.375rem)] bg-surface p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)] ring-1 ring-black/[0.04] md:p-10">
            <div className="flex flex-col items-start gap-3">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                {title}
              </h1>
              {subtitle && <p className="text-[15px] leading-6 text-ink-soft">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
        )}
      </div>
    </div>
  );
}
