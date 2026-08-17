"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/profile";
import { updateUserProfile } from "@/lib/profile";
import { PhoneNumberInput } from "@/components/ui/PhoneNumberInput";
import { PhotoUploadField } from "@/components/portfolio/PhotoUploadField";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";

interface Dict {
  title: string;
  subtitle: string;
  eyebrow: string;
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
  socialsHint: string;
  skillsLabel: string;
  skillsHint: string;
  groupIdentity: string;
  groupContact: string;
  groupPresence: string;
  groupSkills: string;
  identityHint: string;
  contactHint: string;
  avatarLabel: string;
  avatarUpload: string;
  avatarReplace: string;
  socialPlatformPlaceholder: string;
  socialUrlPlaceholder: string;
  skillPlaceholder: string;
  save: string;
  saving: string;
  success: string;
  error: string;
  remove: string;
}

const inputCls =
  "w-full rounded-lg bg-surface px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50";

const labelCls = "text-[13px] font-medium text-ink-soft";

// Quick-add platform presets. Monograms (not brand glyphs) keep the app shell
// within DESIGN.md's Material Symbols iconography.
const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", monogram: "in" },
  { id: "instagram", label: "Instagram", monogram: "IG" },
  { id: "github", label: "GitHub", monogram: "GH" },
  { id: "x", label: "X", monogram: "X" },
  { id: "youtube", label: "YouTube", monogram: "YT" },
  { id: "tiktok", label: "TikTok", monogram: "TT" },
  { id: "website", label: "Website", monogram: "" },
];

function PlatformMark({ id, size = "sm" }: { id: string; size?: "sm" | "md" }) {
  const preset = SOCIAL_PLATFORMS.find((p) => p.id === id);
  const dims =
    size === "md"
      ? "h-8 w-8 rounded-[10px] text-[11px]"
      : "h-5 w-5 rounded-[7px] text-[9px]";
  const label = preset?.monogram ?? "";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center bg-ink/[0.06] font-bold text-ink-soft ring-1 ring-black/5 ${dims}`}
    >
      {label ? (
        label
      ) : (
        <span className="material-symbols-outlined text-[14px]">link</span>
      )}
    </span>
  );
}

function GroupTitle({
  icon,
  children,
  hint,
}: {
  icon: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/[0.08] text-accent-deep ring-1 ring-accent/10">
        <span className="material-symbols-outlined text-[17px]">{icon}</span>
      </span>
      <div className="min-w-0">
        <h2 className="text-[14px] font-bold text-ink">{children}</h2>
        {hint && <p className="mt-0.5 text-[12px] font-medium text-ink-faint">{hint}</p>}
      </div>
      <div className="h-px flex-1 bg-black/5" />
    </div>
  );
}

const removeBtnCls =
  "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger active:scale-95";

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
    avatar_url: profile?.avatar_url || "",
  });

  const [socials, setSocials] = useState<Array<{ platform: string, url: string }>>(profile?.socials || []);
  const [skills, setSkills] = useState<Array<{ name: string, proficiency?: number }>>(profile?.skills || []);

  const [isPending, setIsPending] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePlatform = (id: string) => {
    setSocials((prev) => {
      const exists = prev.some((s) => s.platform === id);
      return exists ? prev.filter((s) => s.platform !== id) : [...prev, { platform: id, url: "" }];
    });
  };
  const isPlatformActive = (id: string) => socials.some((s) => s.platform === id);

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
    const res = await updateUserProfile({
      ...formData,
      socials,
      skills,
    });
    setIsPending(false);
    showToast(res.success ? dict.success : dict.error, res.success ? "success" : "error");
  };

  const addBtnCls =
    "self-start inline-flex items-center gap-1.5 rounded-full border border-dashed border-black/15 px-3.5 py-1.5 text-[12px] font-semibold text-ink-soft transition-colors hover:border-accent/40 hover:bg-accent/[0.04] hover:text-accent-deep active:scale-[0.98]";

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-surface">
      <PageHeader eyebrow={dict.eyebrow} title={dict.title} subtitle={dict.subtitle} />
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 px-6 pt-6 sm:px-8">
            <section>
              <GroupTitle icon="badge" hint={dict.identityHint}>{dict.groupIdentity}</GroupTitle>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <PhotoUploadField
                    label={dict.avatarLabel}
                    value={formData.avatar_url || undefined}
                    onChange={(url) => setFormData((prev) => ({ ...prev, avatar_url: url ?? "" }))}
                    uploadLabel={dict.avatarUpload}
                    replaceLabel={dict.avatarReplace}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="full_name" className={labelCls}>{dict.fullNameLabel}</label>
                  <input id="full_name" name="full_name" type="text" autoComplete="name" required disabled={isPending} value={formData.full_name} onChange={handleChange} placeholder={dict.fullNamePlaceholder} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nickname" className={labelCls}>{dict.nicknameLabel}</label>
                  <input id="nickname" name="nickname" type="text" autoComplete="nickname" disabled={isPending} value={formData.nickname} onChange={handleChange} placeholder={dict.nicknamePlaceholder} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="headline" className={labelCls}>{dict.headlineLabel}</label>
                  <input id="headline" name="headline" type="text" autoComplete="organization-title" disabled={isPending} value={formData.headline} onChange={handleChange} placeholder={dict.headlinePlaceholder} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="bio" className={labelCls}>{dict.bioLabel}</label>
                  <textarea id="bio" name="bio" autoComplete="off" disabled={isPending} value={formData.bio} onChange={handleChange} placeholder={dict.bioPlaceholder} rows={3} className={`${inputCls} resize-none`} />
                </div>
              </div>
            </section>

            <section>
              <GroupTitle icon="contact_mail" hint={dict.contactHint}>{dict.groupContact}</GroupTitle>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="address" className={labelCls}>{dict.addressLabel}</label>
                  <input id="address" name="address" type="text" autoComplete="street-address" disabled={isPending} value={formData.address} onChange={handleChange} placeholder={dict.addressPlaceholder} className={inputCls} />
                </div>
              </div>
            </section>

            <section>
              <GroupTitle icon="link" hint={dict.socialsHint}>{dict.groupPresence}</GroupTitle>

              {/* Quick-add platform chips */}
              <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={dict.socialsLabel}>
                {SOCIAL_PLATFORMS.map((p) => {
                  const active = isPlatformActive(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => togglePlatform(p.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold ring-1 transition-all duration-200 active:scale-[0.97] ${
                        active
                          ? "bg-accent-tint text-accent-deep ring-accent/30"
                          : "bg-surface text-ink-soft ring-black/10 hover:bg-ink/[0.03] hover:text-ink hover:ring-black/20"
                      }`}
                    >
                      <PlatformMark id={p.id} />
                      {p.label}
                      {active && (
                        <span className="material-symbols-outlined text-[13px]">check</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Social rows */}
              {socials.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {socials.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2.5 rounded-xl bg-shell px-3 py-2 ring-1 ring-black/5"
                    >
                      <PlatformMark id={s.platform} size="md" />
                      <input
                        type="text"
                        aria-label={dict.socialPlatformPlaceholder}
                        placeholder={dict.socialPlatformPlaceholder}
                        value={s.platform}
                        onChange={(e) => updateSocial(idx, "platform", e.target.value)}
                        disabled={isPending}
                        className="h-8 w-28 shrink-0 min-w-0 rounded-lg bg-surface px-2.5 text-[12px] font-semibold text-ink ring-1 ring-black/10 placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50"
                      />
                      <input
                        type="url"
                        aria-label={dict.socialUrlPlaceholder}
                        placeholder={dict.socialUrlPlaceholder}
                        value={s.url}
                        onChange={(e) => updateSocial(idx, "url", e.target.value)}
                        disabled={isPending}
                        className="h-8 flex-1 min-w-[160px] rounded-lg bg-transparent px-2.5 text-[13px] text-ink ring-1 ring-black/5 placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocial(idx)}
                        aria-label={dict.remove}
                        className={removeBtnCls}
                      >
                        <span className="material-symbols-outlined text-[17px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] font-medium text-ink-faint">{dict.socialsHint}</p>
              )}
            </section>

            <section>
              <GroupTitle icon="workspaces" hint={dict.skillsHint}>{dict.groupSkills}</GroupTitle>
              {skills.length > 0 && (
                <div className="mb-3 flex flex-col gap-2.5">
                  {skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl bg-shell px-3 py-2 ring-1 ring-black/5"
                    >
                      <span className="material-symbols-outlined shrink-0 text-[16px] text-accent-deep">
                        workspace_premium
                      </span>
                      <input
                        type="text"
                        aria-label={dict.skillPlaceholder}
                        placeholder={dict.skillPlaceholder}
                        value={s.name}
                        onChange={(e) => updateSkill(idx, "name", e.target.value)}
                        disabled={isPending}
                        className="h-8 flex-1 min-w-0 rounded-lg bg-transparent px-2.5 text-[13px] font-medium text-ink ring-1 ring-black/5 placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent transition-shadow disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        aria-label={dict.remove}
                        className={removeBtnCls}
                      >
                        <span className="material-symbols-outlined text-[17px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={addSkill} className={addBtnCls}>
                <span className="material-symbols-outlined text-[14px]">add</span>
                {dict.skillsLabel}
              </button>
            </section>

            {/* Sticky save bar */}
            <div className="sticky bottom-0 z-10 -mx-6 flex items-center gap-4 rounded-b-2xl border-t border-black/5 bg-surface/95 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-sm sm:-mx-8 sm:px-8">
              <button
                type="submit"
                disabled={isPending || !formData.full_name.trim()}
                className="flex items-center justify-center rounded-full bg-accent px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-deep disabled:opacity-50 active:scale-[0.98]"
              >
                {isPending ? dict.saving : dict.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
