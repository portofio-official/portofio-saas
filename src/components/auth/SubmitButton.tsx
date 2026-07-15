"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-accent px-6 py-3 text-white transition-all duration-200 hover:bg-accent-deep active:scale-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep/70"
    >
      <span className="text-sm font-medium">{pending ? pendingLabel : label}</span>
      <span className="flex h-6 w-6 items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </span>
    </button>
  );
}
