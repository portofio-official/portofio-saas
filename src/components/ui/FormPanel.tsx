import { Eyebrow } from "@/components/ui/CtaButton";

export function FormPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
      <div className="flex flex-col gap-6 rounded-[calc(2rem-0.375rem)] bg-surface p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)] ring-1 ring-black/[0.04] md:p-8">
        <div className="flex flex-col gap-2">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="font-display text-2xl font-medium text-ink">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
