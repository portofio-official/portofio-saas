"use client";

import { useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";

/**
 * Shared dialog primitive for dashboard surfaces. Provides ESC-to-close,
 * backdrop-click-to-close, body scroll lock, focus trapping, `role="dialog"`
 * semantics, and focus restoration to the previously focused element.
 *
 * Renders in place (no portal) — mount it at the end of a relatively
 * positioned parent that already sets `z-50`. Use `onOpenChange(false)` from
 * the parent to close.
 */
export function Modal({
  open,
  onOpenChange,
  children,
  className = "",
  panelClassName = "",
  size = "md",
  labelledBy,
  allowBackdropClose = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  size?: "md" | "lg" | "xl";
  labelledBy?: string;
  allowBackdropClose?: boolean;
}) {
  const panelRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const sizeClass =
    size === "xl" ? "w-full max-w-5xl" : size === "lg" ? "w-full max-w-3xl" : "w-full max-w-xl";

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Move focus into the dialog once it renders.
    requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>('button:not([disabled]), a[href], input, select, textarea')
        ?.focus();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm ${className}`}
      onClick={(e) => {
        if (allowBackdropClose && e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`max-h-[90vh] ${sizeClass} overflow-y-auto rounded-2xl bg-surface shadow-floating ring-1 ring-black/5 ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
