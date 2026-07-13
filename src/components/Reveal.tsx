"use client";

import { useReveal } from "@/hooks/useReveal";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
        visible
          ? "opacity-100 translate-y-0 blur-none"
          : "opacity-0 translate-y-16 blur-md motion-reduce:blur-none motion-reduce:translate-y-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
