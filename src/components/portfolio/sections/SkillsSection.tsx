"use client";

import { useState } from "react";
import { FormPanel } from "@/components/ui/FormPanel";

export function SkillsSection({
  eyebrow,
  title,
  placeholder,
  removeLabel,
  skills,
  onChange,
}: {
  eyebrow: string;
  title: string;
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
    <FormPanel eyebrow={eyebrow} title={title}>
      <div className="flex flex-col gap-4">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-3 py-1.5 text-sm text-ink"
              >
                {skill}
                <button
                  type="button"
                  aria-label={removeLabel}
                  onClick={() => onChange(skills.filter((s) => s !== skill))}
                  className="text-ink-soft hover:text-danger"
                >
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </span>
            ))}
          </div>
        )}
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
          className="rounded-2xl bg-surface ring-1 ring-black/[0.07] px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/70 transition-shadow duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        />
      </div>
    </FormPanel>
  );
}
