"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/profile/types";
import { updateUserProfile } from "@/lib/profile/actions";

interface Dict {
  title: string;
  subtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  contactEmailLabel: string;
  contactEmailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
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

export function SettingsClientView({ profile, dict }: { profile: UserProfile | null, dict: Dict }) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    contact_email: profile?.contact_email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    nickname: profile?.nickname || "",
    headline: profile?.headline || "",
    bio: profile?.bio || "",
  });

  const [socials, setSocials] = useState<Array<{platform: string, url: string}>>(profile?.socials || []);
  const [skills, setSkills] = useState<Array<{name: string, proficiency?: number}>>(profile?.skills || []);

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
        <h1 className="text-[24px] font-bold tracking-tight text-[#111827]">{dict.title}</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">{dict.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="full_name" className="text-[13px] font-bold text-[#111827]">{dict.fullNameLabel}</label>
              <input id="full_name" name="full_name" type="text" required disabled={isPending} value={formData.full_name} onChange={handleChange} placeholder={dict.fullNamePlaceholder} className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact_email" className="text-[13px] font-bold text-[#111827]">{dict.contactEmailLabel}</label>
              <input id="contact_email" name="contact_email" type="email" disabled={isPending} value={formData.contact_email} onChange={handleChange} placeholder={dict.contactEmailPlaceholder} className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-[13px] font-bold text-[#111827]">{dict.phoneLabel}</label>
              <input id="phone" name="phone" type="tel" disabled={isPending} value={formData.phone} onChange={handleChange} placeholder={dict.phonePlaceholder} className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="nickname" className="text-[13px] font-bold text-[#111827]">{dict.nicknameLabel}</label>
              <input id="nickname" name="nickname" type="text" disabled={isPending} value={formData.nickname} onChange={handleChange} placeholder={dict.nicknamePlaceholder} className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-[13px] font-bold text-[#111827]">{dict.addressLabel}</label>
            <input id="address" name="address" type="text" disabled={isPending} value={formData.address} onChange={handleChange} placeholder={dict.addressPlaceholder} className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="headline" className="text-[13px] font-bold text-[#111827]">{dict.headlineLabel}</label>
            <input id="headline" name="headline" type="text" disabled={isPending} value={formData.headline} onChange={handleChange} placeholder={dict.headlinePlaceholder} className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="bio" className="text-[13px] font-bold text-[#111827]">{dict.bioLabel}</label>
            <textarea id="bio" name="bio" disabled={isPending} value={formData.bio} onChange={handleChange} placeholder={dict.bioPlaceholder} rows={3} className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
          </div>

          {/* Socials section */}
          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold text-[#111827]">{dict.socialsLabel}</label>
            {socials.map((s, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" placeholder="Platform (e.g. Twitter)" value={s.platform} onChange={e => updateSocial(idx, 'platform', e.target.value)} className="w-1/3 rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
                <input type="url" placeholder="URL" value={s.url} onChange={e => updateSocial(idx, 'url', e.target.value)} className="w-2/3 rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
                <button type="button" onClick={() => removeSocial(idx)} className="text-red-500 hover:text-red-700 px-2">&times;</button>
              </div>
            ))}
            <button type="button" onClick={addSocial} className="self-start text-[13px] text-[#00cf7c] font-medium">+ Add Social</button>
          </div>

          {/* Skills section */}
          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold text-[#111827]">{dict.skillsLabel}</label>
            {skills.map((s, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" placeholder="Skill Name (e.g. React)" value={s.name} onChange={e => updateSkill(idx, 'name', e.target.value)} className="flex-1 rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px]" />
                <button type="button" onClick={() => removeSkill(idx)} className="text-red-500 hover:text-red-700 px-2">&times;</button>
              </div>
            ))}
            <button type="button" onClick={addSkill} className="self-start text-[13px] text-[#00cf7c] font-medium">+ Add Skill</button>
          </div>

          <div className="flex items-center gap-4 border-t border-[#F3F4F6] pt-6 mt-4">
            <button type="submit" disabled={isPending || !formData.full_name.trim()} className="flex items-center justify-center rounded-xl bg-[#00cf7c] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#00b368] disabled:opacity-50">
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
