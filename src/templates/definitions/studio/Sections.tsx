import type { StudioData } from "./schema";

export function StudioHeroSection({
  hero,
  onChange,
}: {
  hero: StudioData["hero"];
  onChange: (patch: Partial<StudioData["hero"]>) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[13px] font-bold text-ink">Hero Section</h3>
        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          Studio
        </span>
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-muted">Headline</label>
        <input
          type="text"
          value={hero.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-ink focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-muted">Subheadline</label>
        <textarea
          rows={2}
          value={hero.subheadline}
          onChange={(e) => onChange({ subheadline: e.target.value })}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-ink focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-muted">CTA Button Label</label>
        <input
          type="text"
          value={hero.ctaLabel}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-ink focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
}

export function StudioExpertiseSection({
  expertise,
  onChange,
}: {
  expertise: StudioData["expertise"];
  onChange: (expertise: StudioData["expertise"]) => void;
}) {
  const add = () => onChange([...expertise, { title: "", description: "" }]);
  const update = (index: number, patch: Partial<StudioData["expertise"][number]>) => {
    const next = [...expertise];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const remove = (index: number) => onChange(expertise.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[13px] font-bold text-ink">Capabilities / Services</h3>
        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          Studio
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {expertise.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-black/5 bg-neutral-50/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Service #{i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[10px] font-semibold text-rose-500 hover:underline"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              placeholder="Title (e.g. Interaction Design)"
              value={item.title}
              onChange={(e) => update(i, { title: e.target.value })}
              className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            />
            <textarea
              rows={2}
              placeholder="Description"
              value={item.description}
              onChange={(e) => update(i, { description: e.target.value })}
              className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border border-dashed border-black/15 py-2 text-xs font-semibold text-muted hover:border-accent hover:text-accent"
      >
        + Add Capability
      </button>
    </div>
  );
}

export function StudioTestimonialsSection({
  testimonials,
  onChange,
}: {
  testimonials: StudioData["testimonials"];
  onChange: (testimonials: StudioData["testimonials"]) => void;
}) {
  const add = () => onChange([...testimonials, { name: "", role: "", quote: "" }]);
  const update = (index: number, patch: Partial<StudioData["testimonials"][number]>) => {
    const next = [...testimonials];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const remove = (index: number) => onChange(testimonials.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[13px] font-bold text-ink">Client Testimonials</h3>
        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          Studio
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {testimonials.map((t, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-black/5 bg-neutral-50/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Quote #{i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[10px] font-semibold text-rose-500 hover:underline"
              >
                Remove
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Quote text"
              value={t.quote}
              onChange={(e) => update(i, { quote: e.target.value })}
              className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Client Name"
                value={t.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              />
              <input
                type="text"
                placeholder="Role & Company"
                value={t.role}
                onChange={(e) => update(i, { role: e.target.value })}
                className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border border-dashed border-black/15 py-2 text-xs font-semibold text-muted hover:border-accent hover:text-accent"
      >
        + Add Testimonial
      </button>
    </div>
  );
}
