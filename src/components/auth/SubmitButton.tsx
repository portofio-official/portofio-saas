"use client";

import { useFormStatus } from "react-dom";
import { ArrowUpRight } from "@phosphor-icons/react";

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
      className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-ink pl-6 pr-2 py-2 text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
    >
      <span className="text-sm font-medium">{pending ? pendingLabel : label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105">
        <ArrowUpRight size={16} weight="light" />
      </span>
    </button>
  );
}
