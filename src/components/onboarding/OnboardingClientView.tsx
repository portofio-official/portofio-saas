"use client";

import { useState } from "react";
import Image from "next/image";
import { CreateWorkspaceForm } from "@/components/workspace/CreateWorkspaceForm";
import { updateUserProfile } from "@/lib/profile/actions";

interface Dict {
  eyebrow: string;
  title: string;
  subtitle: string;
  testimonial: string;
  testimonialAuthor: string;
  testimonialRole: string;
}

interface SettingsDict {
  eyebrow: string;
  title: string;
  subtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  save: string;
  saving: string;
}

export function OnboardingClientView({ 
  dict, 
  settingsDict,
  preferredTemplateId,
  hasProfile
}: { 
  dict: Dict, 
  settingsDict: SettingsDict,
  preferredTemplateId?: string,
  hasProfile: boolean 
}) {
  const [step, setStep] = useState(hasProfile ? 2 : 1);
  const [fullName, setFullName] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsPending(true);
    const result = await updateUserProfile({ full_name: fullName });
    setIsPending(false);
    if (result.success) {
      setStep(2);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F0F3F9] font-sans">
      {/* Left Column: Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / Brand */}
          <div className="mb-12 flex items-center gap-2 text-2xl font-bold tracking-tight text-[#111827]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00cf7c] text-white">
              <span className="material-symbols-outlined text-[20px]">web</span>
            </div>
            Portofio
          </div>

          <div className="mb-8">
            <p className="mb-2 text-[13px] font-bold uppercase tracking-wider text-[#00cf7c]">
              {step === 1 ? settingsDict.eyebrow : dict.eyebrow}
            </p>
            <h1 className="mb-3 text-[32px] font-bold leading-tight tracking-tight text-[#111827]">
              {step === 1 ? settingsDict.title : dict.title}
            </h1>
            <p className="text-[15px] text-[#4B5563]">
              {step === 1 ? settingsDict.subtitle : dict.subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            {step === 1 ? (
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="fullName" className="text-[13px] font-bold text-[#111827]">
                    {settingsDict.fullNameLabel}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    disabled={isPending}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={settingsDict.fullNamePlaceholder}
                    className="rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#00cf7c] focus:outline-none focus:ring-1 focus:ring-[#00cf7c] disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending || !fullName.trim()}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#00cf7c] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#00b368] disabled:opacity-50"
                >
                  {isPending ? settingsDict.saving : settingsDict.save}
                </button>
              </form>
            ) : (
              <CreateWorkspaceForm templateId={preferredTemplateId} />
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Visual (Hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-white p-12 md:flex border-l border-black/5">
        <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-[#F0F3F9] shadow-sm ring-1 ring-black/5">
            <Image
              src="/images/onboarding-hero.png"
              alt="Workspace creation illustration"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Testimonial */}
          <div className="mt-12 rounded-2xl border border-black/5 bg-[#F9FAFB] p-8 text-center shadow-sm max-w-md">
            <p className="mb-6 text-[15px] font-medium leading-relaxed text-[#111827]">
              {dict.testimonial}
            </p>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[13px] font-bold text-[#111827]">{dict.testimonialAuthor}</span>
              <span className="text-[12px] font-medium text-[#6B7280]">{dict.testimonialRole}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
