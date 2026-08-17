/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { FormPanel } from "@/components/ui/FormPanel";

export function SkillsSection({
  eyebrow,
  title,
  description,
  placeholder,
  removeLabel,
  skills,
  onChange,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  placeholder: string;
  removeLabel: string;
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addSkill() {
    const value = draft.trim();
    if (value && !skills.includes(value)) {
      onChange([...skills, value]);
    }
    setDraft("");
  }

  return (
    <FormPanel title={title} description={description}>
      <div className="flex flex-col gap-4">
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-[0.5rem] bg-black/[0.04] px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-black/[0.08]"
              >
                {skill}
                <button
                  type="button"
                  aria-label={removeLabel}
                  onClick={() => onChange(skills.filter((s) => s !== skill))}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/[0.06] hover:text-danger active:bg-black/10 ml-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-black/[0.02] border border-dashed border-black/10 rounded-xl text-center mb-2">
            <span className="text-[12px] text-ink-soft leading-relaxed">
              {description || "Add your first skill to get started."}
            </span>
          </div>
        )}
        <div className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder={placeholder}
            className="w-full rounded-[1rem] bg-white ring-1 ring-black/[0.1] px-4 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/70 transition-all shadow-sm pr-12"
          />
          <button
            onClick={addSkill}
            disabled={!draft.trim()}
            className="absolute right-1 top-1 bottom-1 flex w-9 items-center justify-center bg-accent text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 active:scale-95 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
      </div>
    </FormPanel>
  );
}
