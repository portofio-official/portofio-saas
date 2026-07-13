import { useTranslations } from "next-intl";
import {
  ArrowsClockwise,
  NotePencil,
  Rocket,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import { FloatingNav } from "@/components/FloatingNav";
import { Reveal } from "@/components/Reveal";
import { CtaButton, Eyebrow } from "@/components/ui/CtaButton";

const FEATURE_ICONS = [NotePencil, SquaresFour, ArrowsClockwise, Rocket];

export default function Home() {
  const hero = useTranslations("Hero");
  const features = useTranslations("Features");
  const templates = useTranslations("Templates");
  const pricing = useTranslations("Pricing");
  const footer = useTranslations("Footer");

  const featureItems = features.raw("items") as { title: string; description: string }[];
  const templateItems = templates.raw("items") as { name: string; description: string }[];
  const pricingFeatures = pricing.raw("features") as string[];

  return (
    <div className="flex flex-1 flex-col">
      <FloatingNav />

      <main className="flex-1">
        {/* Hero — Editorial Split */}
        <section className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center gap-16 px-6 pt-32 pb-16 md:grid md:grid-cols-2 md:items-center md:gap-12 md:pt-24">
          <Reveal className="flex flex-col items-start gap-6">
            <Eyebrow>{hero("eyebrow")}</Eyebrow>
            <h1 className="font-display text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-ink">
              {hero("title")}
            </h1>
            <p className="max-w-md text-lg leading-7 text-ink-soft">{hero("subtitle")}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <CtaButton label={hero("ctaPrimary")} href="/signup" />
              <CtaButton label={hero("ctaSecondary")} href="#templates" variant="secondary" />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
              <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)] ring-1 ring-black/[0.04]">
                <div className="flex items-center gap-3 border-b border-black/[0.04] px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  </div>
                  <span className="rounded-full bg-black/[0.04] px-3 py-1 font-mono text-xs text-ink-soft">
                    {hero("previewLabel")}
                  </span>
                </div>
                <div className="space-y-4 p-6 md:p-8">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                    <span className="text-[13px] text-ink-soft">{hero("previewStatus")}</span>
                  </div>
                  <div className="h-4 w-2/3 rounded-full bg-black/[0.06]" />
                  <div className="h-3 w-1/2 rounded-full bg-black/[0.04]" />
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="aspect-square rounded-2xl bg-accent-tint" />
                    <div className="aspect-square rounded-2xl bg-black/[0.04]" />
                    <div className="aspect-square rounded-2xl bg-black/[0.04]" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Features — Asymmetric Bento */}
        <section id="features" className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="mb-12 flex flex-col gap-4">
            <Eyebrow>{features("eyebrow")}</Eyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.02em] text-ink">
              {features("title")}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
            {featureItems.map((item, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              const spanClass =
                i === 0 ? "md:col-span-8 md:row-span-2" : "md:col-span-4";
              return (
                <Reveal key={item.title} delay={i * 60} className={spanClass}>
                  <div className="h-full rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
                    <div
                      className={`flex h-full flex-col justify-between gap-8 rounded-[calc(2rem-0.375rem)] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)] ring-1 ring-black/[0.04] md:p-8 ${
                        i === 0 ? "bg-accent-tint" : "bg-surface"
                      }`}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/[0.04] text-ink">
                        <Icon size={20} weight="light" />
                      </span>
                      <div className="flex flex-col gap-2">
                        <h3 className="font-display text-xl font-medium text-ink md:text-2xl">
                          {item.title}
                        </h3>
                        <p className="text-[15px] leading-6 text-ink-soft">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Templates teaser */}
        <section id="templates" className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="mb-12 flex flex-col gap-4">
            <Eyebrow>{templates("eyebrow")}</Eyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.02em] text-ink">
              {templates("title")}
            </h2>
            <p className="max-w-md text-lg leading-7 text-ink-soft">{templates("subtitle")}</p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
            {templateItems.map((item, i) => (
              <Reveal
                key={item.name}
                delay={i * 60}
                className={i === 0 ? "md:col-span-6" : "md:col-span-3"}
              >
                <div className="h-full rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
                  <div className="flex h-full flex-col justify-between gap-6 rounded-[calc(2rem-0.375rem)] bg-surface p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)] ring-1 ring-black/[0.04] md:p-8">
                    <div className="aspect-[4/3] rounded-2xl bg-black/[0.04]" />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-display text-xl font-medium text-ink">{item.name}</h3>
                      <p className="text-[15px] leading-6 text-ink-soft">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Pricing — single plan */}
        <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>{pricing("eyebrow")}</Eyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.02em] text-ink">
              {pricing("title")}
            </h2>
            <p className="max-w-md text-lg leading-7 text-ink-soft">{pricing("subtitle")}</p>
          </Reveal>

          <Reveal delay={100} className="mx-auto mt-12 max-w-md">
            <div className="rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
              <div className="flex flex-col gap-6 rounded-[calc(2rem-0.375rem)] bg-surface p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)] ring-1 ring-black/[0.04] md:p-10">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl font-semibold tracking-[-0.02em] text-ink">
                    {pricing("price")}
                  </span>
                  <span className="text-ink-soft">{pricing("period")}</span>
                </div>
                <ul className="flex flex-col gap-3">
                  {pricingFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-[15px] text-ink-soft">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <CtaButton label={pricing("cta")} href="/signup" variant="primary" />
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-2 border-t border-black/5 pt-8 text-center">
          <span className="font-display text-lg font-medium text-ink">Portofio</span>
          <p className="text-sm text-ink-soft">{footer("tagline")}</p>
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} Portofio. {footer("rights")}</p>
        </div>
      </footer>
    </div>
  );
}
