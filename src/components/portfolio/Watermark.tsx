// Basic-tier badge shown on every published site (entitlements.watermark).
// Premium/Enterprise entitlements set watermark=false and this simply isn't
// rendered — see getEntitlementsByAdmin() in src/lib/billing/entitlements.ts.
export function Watermark() {
  return (
    <a
      href="https://portofio.id?utm_source=watermark"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-neutral-600 shadow-md ring-1 ring-black/10 backdrop-blur transition-colors hover:text-neutral-900"
    >
      Dibuat dengan <span className="font-bold text-neutral-900">Portofio</span>
    </a>
  );
}
