/* eslint-disable @typescript-eslint/no-unused-vars */
import { Eyebrow } from "@/components/ui/CtaButton";

export function FormPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      {(title || description) && (
        <div className="flex flex-col gap-1.5 pb-2 border-b border-black/5">
          {title && <h3 className="text-[13px] font-bold text-ink">{title}</h3>}
          {description && <p className="text-[12px] text-ink-soft leading-relaxed">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
