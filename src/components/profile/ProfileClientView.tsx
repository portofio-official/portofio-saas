"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/profile";
import { updateUserProfile } from "@/lib/profile";
import { PhoneNumberInput } from "@/components/ui/PhoneNumberInput";

interface Dict {
  title: string;
  subtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  contactEmailLabel: string;
  contactEmailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHint: string;
  countrySearch: string;
  noCountryHint: string;
  addressLabel: string;
  addressPlaceholder: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  headlineLabel: string;
  headlinePlaceholder: string;
  bioLabel: string;
  bioPlaceholder: string;
  socialsLabel: string;
  skillsLabel: string;
  save: string;
  saving: string;
  success: string;
  error: string;
}

const inputCls =
  "w-full rounded-lg bg-surface px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50";

const labelCls = "text-[13px] font-medium text-ink-soft";

export function ProfileClientView({ profile, locale = "en", dict }: {
  profile: UserProfile | null;
  locale: string;
  dict: Dict;
}) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    contact_email: profile?.contact_email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    nickname: profile?.nickname || "",
    headline: profile?.headline || "",
    bio: profile?.bio || "",
  });

  const [socials, setSocials] = useState<Array<{ platform: string, url: string }>>(profile?.socials || []);
  const [skills, setSkills] = useState<Array<{ name: string, proficiency?: number }>>(profile?.skills || []);

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSocial = () => setSocials([...socials, { platform: "", url: "" }]);
  const updateSocial = (index: number, field: string, value: string) => {
    const newSocials = [...socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setSocials(newSocials);
  };
  const removeSocial = (index: number) => setSocials(socials.filter((_, i) => i !== index));

  const addSkill = () => setSkills([...skills, { name: "", proficiency: 100 }]);
  const updateSkill = (index: number, field: string, value: string | number) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);
    const res = await updateUserProfile({
      ...formData,
      socials,
      skills,
    });
    setIsPending(false);
    if (res.success) {
      setMessage({ type: 'success', text: dict.success });
    } else {
      setMessage({ type: 'error', text: dict.error });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-ink">{dict.title}</h1>
        <p className="mt-1 text-[14px] text-ink-soft">{dict.subtitle}</p>
      </div>

      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="full_name" className={labelCls}>{dict.fullNameLabel}</label>
              <input id="full_name" name="full_name" type="text" autoComplete="name" required disabled={isPending} value={formData.full_name} onChange={handleChange} placeholder={dict.fullNamePlaceholder} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact_email" className={labelCls}>{dict.contactEmailLabel}</label>
              <input id="contact_email" name="contact_email" type="email" autoComplete="email" disabled={isPending} value={formData.contact_email} onChange={handleChange} placeholder={dict.contactEmailPlaceholder} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className={labelCls}>{dict.phoneLabel}</label>
              <PhoneNumberInput
                id="phone"
                locale={locale}
                disabled={isPending}
                value={formData.phone}
                onChange={(v) => setFormData((prev) => ({ ...prev, phone: v }))}
                placeholder={dict.phonePlaceholder}
                countrySearch={dict.countrySearch}
                noCountryHint={dict.noCountryHint}
              />
              <p className="text-[12px] text-ink-faint">{dict.phoneHint}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="nickname" className={labelCls}>{dict.nicknameLabel}</label>
              <input id="nickname" name="nickname" type="text" autoComplete="nickname" disabled={isPending} value={formData.nickname} onChange={handleChange} placeholder={dict.nicknamePlaceholder} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className={labelCls}>{dict.addressLabel}</label>
            <input id="address" name="address" type="text" autoComplete="street-address" disabled={isPending} value={formData.address} onChange={handleChange} placeholder={dict.addressPlaceholder} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="headline" className={labelCls}>{dict.headlineLabel}</label>
            <input id="headline" name="headline" type="text" autoComplete="organization-title" disabled={isPending} value={formData.headline} onChange={handleChange} placeholder={dict.headlinePlaceholder} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className={labelCls}>{dict.bioLabel}</label>
            <textarea id="bio" name="bio" autoComplete="off" disabled={isPending} value={formData.bio} onChange={handleChange} placeholder={dict.bioPlaceholder} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className={labelCls}>{dict.socialsLabel}</label>
            {socials.map((s, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" placeholder="Platform (e.g. Twitter)" value={s.platform} onChange={e => updateSocial(idx, 'platform', e.target.value)} className={`${inputCls} w-1/3`} />
                <input type="url" placeholder="https://…" value={s.url} onChange={e => updateSocial(idx, 'url', e.target.value)} className={`${inputCls} w-2/3`} />
                <button type="button" onClick={() => removeSocial(idx)} className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger" aria-label="Remove">
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
              </div>
            ))}
            <button type="button" onClick={addSocial} className="self-start flex items-center gap-1 text-[13px] font-medium text-accent hover:text-accent-deep">
              <span className="material-symbols-outlined text-[16px]">add</span>
              {dict.socialsLabel}
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className={labelCls}>{dict.skillsLabel}</label>
            {skills.map((s, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" placeholder="Skill (e.g. React)" value={s.name} onChange={e => updateSkill(idx, 'name', e.target.value)} className={`${inputCls} flex-1`} />
                <button type="button" onClick={() => removeSkill(idx)} className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger" aria-label="Remove">
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
              </div>
            ))}
            <button type="button" onClick={addSkill} className="self-start flex items-center gap-1 text-[13px] font-medium text-accent hover:text-accent-deep">
              <span className="material-symbols-outlined text-[16px]">add</span>
              {dict.skillsLabel}
            </button>
          </div>

          <div className="flex items-center gap-4 border-t border-black/5 pt-6 mt-4">
            <button type="submit" disabled={isPending || !formData.full_name.trim()} className="flex items-center justify-center rounded-full bg-accent px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-accent-deep disabled:opacity-50">
              {isPending ? dict.saving : dict.save}
            </button>
            {message && (
              <span className={`text-[13px] font-medium ${message.type === 'success' ? 'text-positive' : 'text-danger'}`}>
                {message.text}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}