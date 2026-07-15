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
    <div className="flex min-h-[100dvh] items-center justify-center px-6 py-24 bg-canvas">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6 rounded-2xl bg-surface p-8 shadow-md ring-1 ring-black/5 md:p-10">
          <div className="flex flex-col items-start gap-3">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle && <p className="text-[15px] leading-6 text-ink-soft">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
        )}
      </div>
    </div>
  );
}
