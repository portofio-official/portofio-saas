"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { updateTemplateStatusAction } from "@/lib/admin/actions";

interface Props {
  submissionId: string;
}

export function ReviewTemplateDropdown({ submissionId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: "approved" | "rejected" | "revision_requested") => {
    setIsOpen(false);

    let reviewNotes = "";
    let registryId = "";

    if (action === "approved") {
      const input = window.prompt("Enter the registry_id for this template (e.g. 'minimal', 'bold'):");
      if (input === null) return; // cancelled
      if (!input.trim()) {
        window.alert("registry_id is required to approve a template.");
        return;
      }
      registryId = input.trim();
      
      const notes = window.prompt("(Optional) Enter approval notes for the designer:");
      if (notes) reviewNotes = notes.trim();
    } 
    else if (action === "rejected") {
      const notes = window.prompt("Enter rejection reason (required):");
      if (notes === null) return;
      if (!notes.trim()) {
        window.alert("Rejection reason is required.");
        return;
      }
      reviewNotes = notes.trim();
    }
    else if (action === "revision_requested") {
      const notes = window.prompt("Enter revision instructions (required):");
      if (notes === null) return;
      if (!notes.trim()) {
        window.alert("Revision instructions are required.");
        return;
      }
      reviewNotes = notes.trim();
    }

    startTransition(async () => {
      try {
        await updateTemplateStatusAction(submissionId, action, reviewNotes, registryId);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:bg-black/[0.08] disabled:opacity-50"
      >
        <span>{isPending ? "Updating..." : "Review"}</span>
        <span className="material-symbols-outlined text-[16px]">expand_more</span>
      </button>

      {isOpen && !isPending && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-[12px] bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
          <button
            onClick={() => handleAction("approved")}
            className="block w-full px-4 py-2 text-left text-[13px] text-ink hover:bg-black/[0.03]"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction("revision_requested")}
            className="block w-full px-4 py-2 text-left text-[13px] text-ink hover:bg-black/[0.03]"
          >
            Request Revision
          </button>
          <button
            onClick={() => handleAction("rejected")}
            className="block w-full px-4 py-2 text-left text-[13px] text-danger hover:bg-danger/10"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
