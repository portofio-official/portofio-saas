export type DeviceType = "desktop" | "mobile" | "tablet" | "bot" | "other";

const BOT_RE = /bot|crawler|spider|scraper|headless|preview|slurp|curl|wget|lighthouse/i;
const TABLET_RE = /ipad|tablet|playbook|silk|kindle/i;
const MOBILE_RE = /mobile|iphone|ipod|blackberry|android|iemobile|windows phone|opera mini/i;

export function classifyDevice(ua?: string | null): DeviceType {
  if (!ua) return "other";
  if (BOT_RE.test(ua)) return "bot";
  if (TABLET_RE.test(ua)) return "tablet";
  if (MOBILE_RE.test(ua)) return "mobile";
  return "desktop";
}

export function classifyBrowser(ua?: string | null): string | null {
  if (!ua) return null;
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/msie|trident\//i.test(ua)) return "Internet Explorer";
  if (/safari/i.test(ua)) return "Safari";
  return null;
}