"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTemplateStatusAction } from "@/lib/admin";
import { useTranslations } from "next-intl";

interface Props {
  submissionId: string;
}

export function ReviewTemplateDropdown({ submissionId }: Props) {
  const t = useTranslations("Admin");
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleAction = (action: "approved" | "rejected" | "revision_requested") => {
    setIsOpen(false);

    let reviewNotes = "";
    let registryId = "";

    if (action === "approved") {
      const input = window.prompt(t("review.registrationHint"));
      if (input) registryId = input.trim();

      const notes = window.prompt(t("review.approvalHint"));
      if (notes) reviewNotes = notes.trim();
    } 
    else if (action === "rejected") {
      const notes = window.prompt(t("review.rejectionHint"));
      if (notes === null) return;
      if (!notes.trim()) {
        window.alert(t("review.rejectionRequired"));
        return;
      }
      reviewNotes = notes.trim();
    }
    else if (action === "revision_requested") {
      const notes = window.prompt(t("review.revisionHint"));
      if (notes === null) return;
      if (!notes.trim()) {
        window.alert(t("review.revisionRequired"));
        return;
      }
      reviewNotes = notes.trim();
    }

    startTransition(async () => {
      try {
        await updateTemplateStatusAction(submissionId, action, reviewNotes, registryId);
        router.refresh();
      } catch (err) {
        window.alert(err instanceof Error ? err.message : t("review.errorGeneric"));
      }
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full bg-ink/[0.05] px-3.5 py-2 text-[12px] font-semibold text-ink ring-1 ring-black/5 transition-colors hover:bg-ink/[0.08] disabled:opacity-50"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{isPending ? t("review.updating") : t("review.trigger")}</span>
        <span className="material-symbols-outlined text-[16px]">expand_more</span>
      </button>

      {isOpen && !isPending && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/5 focus:outline-none animate-fade-in-up-custom"
          role="menu"
        >
          <button
            onClick={() => handleAction("approved")}
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-ink hover:bg-ink/[0.04] active:bg-ink/[0.06]"
          >
            {t("review.approve")}
          </button>
          <button
            onClick={() => handleAction("revision_requested")}
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-ink hover:bg-ink/[0.04] active:bg-ink/[0.06]"
          >
            {t("review.revision")}
          </button>
          <button
            onClick={() => handleAction("rejected")}
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-danger hover:bg-danger/10 active:bg-danger/[0.12]"
          >
            {t("review.reject")}
          </button>
        </div>
      )}
    </div>
  );
}