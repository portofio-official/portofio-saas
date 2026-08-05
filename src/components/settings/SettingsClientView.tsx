"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/profile/types";
import { updateUserProfile } from "@/lib/profile/actions";

interface Dict {
  title: string;
  subtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  save: string;
  saving: string;
  success: string;
  error: string;
}

export function SettingsClientView({ profile, dict }: { profile: UserProfile | null, dict: Dict }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);
    const res = await updateUserProfile({ full_name: fullName });
    setIsPending(false);
    if (res.success) {
      setMessage({ type: 'success', text: dict.success });
    } else {
      setMessage({ type: 'error', text: dict.error });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[#111827]">{dict.title}</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">{dict.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-[13px] font-bold text-[#111827]">
              {dict.fullNameLabel}
            </label>
            <input
              id="fullName"
              type="text"
              required
              disabled={isPending}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={dict.fullNamePlaceholder}
              className="rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#00cf7c] focus:outline-none focus:ring-1 focus:ring-[#00cf7c] disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-4 border-t border-[#F3F4F6] pt-6">
            <button
              type="submit"
              disabled={isPending || !fullName.trim() || fullName === profile?.full_name}
              className="flex items-center justify-center rounded-xl bg-[#00cf7c] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#00b368] disabled:opacity-50"
            >
              {isPending ? dict.saving : dict.save}
            </button>
            {message && (
              <span className={`text-[13px] font-medium ${message.type === 'success' ? 'text-[#00b368]' : 'text-red-500'}`}>
                {message.text}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
