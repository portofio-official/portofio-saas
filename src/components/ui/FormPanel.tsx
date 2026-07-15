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
    <div className="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <div className="flex flex-col gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}
