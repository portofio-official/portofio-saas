"use client";

import type { FreelancerData } from "./schema";

// ─────────────────────────────────────────────────────────────────────────────
// FreelancerPricingSection — brand-new form component, didn't exist in any
// previous template. Owns the `pricing` section for the freelancer template.
// ─────────────────────────────────────────────────────────────────────────────
export function FreelancerPricingSection({
  pricing,
  onChange,
}: {
  pricing: FreelancerData["pricing"];
  onChange: (pricing: FreelancerData["pricing"]) => void;
}) {
  const PERIODS = ["monthly", "yearly", "one-time"] as const;

  const add = () =>
    onChange([
      ...pricing,
      {
        name: "",
        price: 0,
        currency: "USD",
        period: "one-time",
        features: [],
        highlighted: false,
      },
    ]);

  const update = (
    index: number,
    patch: Partial<FreelancerData["pricing"][number]>,
  ) => {
    const next = [...pricing];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateFeatures = (index: number, raw: string) => {
    const features = raw
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    update(index, { features });
  };

  const remove = (index: number) =>
    onChange(pricing.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[13px] font-bold text-ink">
          Pricing Tiers
        </h3>
        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          Freelancer
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {pricing.map((tier, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-lg border border-black/5 bg-neutral-50/50 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Tier #{i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[10px] font-semibold text-rose-500 hover:underline"
              >
                Remove
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="mb-0.5 block text-[10px] font-semibold text-muted">
                Tier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Starter"
                value={tier.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[10px] font-semibold text-muted">
                  Price (0 = Custom)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="800"
                  value={tier.price}
                  onChange={(e) =>
                    update(i, { price: Number(e.target.value) })
                  }
                  className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-semibold text-muted">
                  Currency
                </label>
                <input
                  type="text"
                  placeholder="USD"
                  value={tier.currency}
                  onChange={(e) => update(i, { currency: e.target.value })}
                  className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="mb-0.5 block text-[10px] font-semibold text-muted">
                Billing Period
              </label>
              <select
                value={tier.period}
                onChange={(e) =>
                  update(i, {
                    period: e.target.value as typeof PERIODS[number],
                  })
                }
                className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none bg-white"
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="mb-0.5 block text-[10px] font-semibold text-muted">
                Features (one per line)
              </label>
              <textarea
                rows={3}
                placeholder={"Responsive design\n3 revisions\n1 month support"}
                value={tier.features.join("\n")}
                onChange={(e) => updateFeatures(i, e.target.value)}
                className="w-full rounded border border-black/10 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {/* Highlight toggle */}
            <label className="flex items-center gap-2 text-[11px] font-medium text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tier.highlighted}
                onChange={(e) => update(i, { highlighted: e.target.checked })}
                className="h-3.5 w-3.5 accent-accent"
              />
              Highlight this tier (recommended)
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border border-dashed border-black/15 py-2 text-xs font-semibold text-muted hover:border-accent hover:text-accent"
      >
        + Add Pricing Tier
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FreelancerTestimonialsSection — reuses testimonialSchema atom shape
// ─────────────────────────────────────────────────────────────────────────────
export function FreelancerTestimonialsSection({
  testimonials,
  onChange,
}: {
  testimonials: FreelancerData["testimonials"];
  onChange: (testimonials: FreelancerData["testimonials"]) => void;
}) {
  const add = () =>
    onChange([...testimonials, { name: "", role: "", quote: "" }]);

  const update = (
    index: number,
    patch: Partial<FreelancerData["testimonials"][number]>,
  ) => {
    const next = [...testimonials];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const remove = (index: number) =>
    onChange(testimonials.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[13px] font-bold text-ink">
          Client Testimonials
        </h3>
        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          Freelancer
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-lg border border-black/5 bg-neutral-50/50 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Quote #{i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[10px] font-semibold text-rose-500 hover:underline"
              >
                Remove
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Quote text"
              value={t.quote ?? ""}
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
                value={t.role ?? ""}
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
