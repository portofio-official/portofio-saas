import type { StudioData } from "@/components/templates/studio/schema";

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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink-soft">Headline</label>
          <input
            className="w-full rounded-lg border border-black/10 bg-surface px-3 py-2 text-[12px] text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            value={hero?.headline || ""}
            onChange={(e) => onChange({ headline: e.target.value })}
            placeholder="We build digital experiences."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink-soft">Subheadline</label>
          <textarea
            className="w-full resize-none rounded-lg border border-black/10 bg-surface px-3 py-2 text-[12px] text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            rows={2}
            value={hero?.subheadline || ""}
            onChange={(e) => onChange({ subheadline: e.target.value })}
            placeholder="An independent studio..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink-soft">CTA Button Label</label>
          <input
            className="w-full rounded-lg border border-black/10 bg-surface px-3 py-2 text-[12px] text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            value={hero?.ctaLabel || ""}
            onChange={(e) => onChange({ ctaLabel: e.target.value })}
            placeholder="View Selected Work"
          />
        </div>
      </div>
    </div>
  );
}

export function StudioExpertiseSection({
  items,
  onChange,
}: {
  items: StudioData["expertise"];
  onChange: (items: StudioData["expertise"]) => void;
}) {
  const handleAdd = () => {
    onChange([...(items || []), { title: "", description: "" }]);
  };

  const handleUpdate = (idx: number, patch: Partial<StudioData["expertise"][0]>) => {
    const newItems = [...(items || [])];
    newItems[idx] = { ...newItems[idx], ...patch };
    onChange(newItems);
  };

  const handleRemove = (idx: number) => {
    onChange((items || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[13px] font-bold text-ink">Capabilities</h3>
        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          Studio
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {(items || []).map((item, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-black/5 bg-surface p-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="text-[10px] font-medium text-danger hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-ink-soft">Title</label>
              <input
                className="w-full rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                value={item.title}
                onChange={(e) => handleUpdate(i, { title: e.target.value })}
                placeholder="e.g. Digital Product Design"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-ink-soft">Description</label>
              <textarea
                className="w-full resize-none rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                rows={2}
                value={item.description}
                onChange={(e) => handleUpdate(i, { description: e.target.value })}
                placeholder="We design intuitive interfaces..."
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 bg-surface py-2 text-[11px] font-medium text-ink-soft hover:border-black/30 hover:bg-black/5 hover:text-ink"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Add Capability
        </button>
      </div>
    </div>
  );
}

export function StudioTestimonialsSection({
  items,
  onChange,
}: {
  items: StudioData["testimonials"];
  onChange: (items: StudioData["testimonials"]) => void;
}) {
  const handleAdd = () => {
    onChange([...(items || []), { name: "", role: "", quote: "" }]);
  };

  const handleUpdate = (idx: number, patch: Partial<StudioData["testimonials"][0]>) => {
    const newItems = [...(items || [])];
    newItems[idx] = { ...newItems[idx], ...patch };
    onChange(newItems);
  };

  const handleRemove = (idx: number) => {
    onChange((items || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[13px] font-bold text-ink">Client Perspectives</h3>
        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          Studio
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {(items || []).map((item, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-black/5 bg-surface p-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="text-[10px] font-medium text-danger hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-ink-soft">Quote</label>
              <textarea
                className="w-full resize-none rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                rows={3}
                value={item.quote}
                onChange={(e) => handleUpdate(i, { quote: e.target.value })}
                placeholder="The team delivered exceptional results..."
              />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[11px] font-bold text-ink-soft">Name</label>
                <input
                  className="w-full rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                  value={item.name}
                  onChange={(e) => handleUpdate(i, { name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[11px] font-bold text-ink-soft">Role / Company</label>
                <input
                  className="w-full rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                  value={item.role}
                  onChange={(e) => handleUpdate(i, { role: e.target.value })}
                  placeholder="CEO, Acme Corp"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 bg-surface py-2 text-[11px] font-medium text-ink-soft hover:border-black/30 hover:bg-black/5 hover:text-ink"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Add Perspective
        </button>
      </div>
    </div>
  );
}
