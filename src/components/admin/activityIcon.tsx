import type { Icon } from "@phosphor-icons/react";
import {
  UserCircle,
  Palette,
  Prohibit,
  ShieldCheck,
  ClockCounterClockwise,
} from "@phosphor-icons/react/dist/ssr";

/**
 * Maps an admin_audit_logs `action` string (e.g. "user.suspension",
 * "template.visibility") to a Phosphor icon + accent tone, shared between
 * the Overview "Recent Activity" panel and the full Audit Log page so the
 * same action always reads the same way in both places.
 */
export function getActivityVisual(action: string): { icon: Icon; tone: string; bg: string } {
  const prefix = action.split(".")[0];
  switch (prefix) {
    case "user":
      return { icon: UserCircle, tone: "text-accent-deep", bg: "bg-accent/10" };
    case "template":
      return { icon: Palette, tone: "text-info", bg: "bg-info-soft" };
    case "blocklist":
      return { icon: Prohibit, tone: "text-danger", bg: "bg-danger/10" };
    case "role":
      return { icon: ShieldCheck, tone: "text-warning", bg: "bg-warning-soft" };
    default:
      return { icon: ClockCounterClockwise, tone: "text-ink-faint", bg: "bg-ink/[0.05]" };
  }
}
