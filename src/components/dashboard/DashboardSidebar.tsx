"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ContentType } from "@/lib/content/types";
import {
  Award,
  BookOpen,
  Briefcase,
  ChartLine,
  ChevronDown,
  CreditCard,
  FolderKanban,
  FolderOpen,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  LayoutTemplate,
  LogOut,
  MessageSquareQuote,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  disabled?: boolean;
  count?: number;
}

interface ContentChild extends NavItem {
  type: ContentType;
}

// The seven primary Content Library types surfaced in the sidebar.
// (caseStudy/gallery stay selectable in the manager but are not linked here.)
const CONTENT_GROUPS: { type: ContentType; icon: ReactNode }[] = [
  { type: "project", icon: <FolderKanban className="size-4" /> },
  { type: "testimonial", icon: <MessageSquareQuote className="size-4" /> },
  { type: "certificate", icon: <Award className="size-4" /> },
  { type: "experience", icon: <Briefcase className="size-4" /> },
  { type: "education", icon: <GraduationCap className="size-4" /> },
  { type: "publication", icon: <BookOpen className="size-4" /> },
  { type: "media", icon: <ImageIcon className="size-4" /> },
];

const KNOWN_BASES = [
  "/dashboard/templates",
  "/dashboard/content",
  "/dashboard/analytics",
  "/dashboard/profile",
  "/dashboard/billing",
];

export function DashboardSidebar({
  email,
  contentCounts = {},
  isPremium = false,
}: {
  email: string;
  contentCounts?: Record<string, number>;
  isPremium?: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const tc = useTranslations("ContentLibrary");
  const tw = useTranslations("Workspace");

  const isEditorPath = pathname?.endsWith("/editor") ?? false;

  // Normalize "/id/dashboard/..." → "/dashboard/..."
  const path = pathname?.replace(/^\/(id|en)(?=\/|$)/, "") ?? "/dashboard";

  const isTemplates = path.startsWith("/dashboard/templates");
  const isAnalytics = path.startsWith("/dashboard/analytics");
  const isProfile = path.startsWith("/dashboard/profile");
  const isBilling = path.startsWith("/dashboard/billing");
  const isKnown = KNOWN_BASES.some((base) => path.startsWith(base));
  const isWebsites = !isKnown;

  const primaryItems: NavItem[] = [
    { href: "/dashboard", icon: <Globe className="size-4" />, label: t("websites"), active: isWebsites },
    { href: "/dashboard/templates", icon: <LayoutTemplate className="size-4" />, label: t("templates"), active: isTemplates },
  ];

  const contentItems: ContentChild[] = CONTENT_GROUPS.map((c) => ({
    ...c,
    href: `/dashboard/content/${c.type}`,
    label: tc(`types.${c.type}`),
    active: path === `/dashboard/content/${c.type}`,
    count: contentCounts[c.type] ?? 0,
  }));
  const contentParentActive = contentItems.some((c) => c.active);

  const analyticsItem: NavItem = {
    href: "/dashboard/analytics",
    icon: <ChartLine className="size-4" />,
    label: t("analytics"),
    active: isAnalytics,
    badge: t("pro"),
  };

  const settingsItems: NavItem[] = [
    { href: "/dashboard/profile", icon: <User className="size-4" />, label: t("profile"), active: isProfile },
    { href: "#", icon: <Globe className="size-4" />, label: t("domains"), active: false, disabled: true },
    { href: "/dashboard/billing", icon: <CreditCard className="size-4" />, label: t("billing"), active: isBilling },
  ];
  const settingsParentActive = settingsItems.some((c) => c.active);

  const [contentOpen, setContentOpen] = useState(contentParentActive);
  const [settingsOpen, setSettingsOpen] = useState(settingsParentActive);

  if (isEditorPath) return null;

  const initials = email.charAt(0).toUpperCase();

  const renderItem = (item: NavItem, indented = false) => {
    if (item.disabled) {
      return (
        <SidebarMenuItem key={item.label}>
          <div className="flex w-full cursor-not-allowed items-center gap-2 rounded-md px-2 py-2 text-[13px] font-medium text-ink-faint">
            <div className={cn("flex min-w-0 flex-1 items-center gap-2", indented && "pl-3")}>
              {item.icon}
              <span className="truncate">{item.label}</span>
            </div>
            <span className="shrink-0 rounded-full bg-ink/[0.06] px-2 py-0.5 text-[9px] font-semibold tracking-wider text-ink-faint uppercase">
              {t("comingSoon")}
            </span>
          </div>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={item.active}
          tooltip={item.label}
          className={cn(
            "group/menu-button relative rounded-lg text-[13px] transition-colors duration-150",
            item.active
              ? "bg-accent/[0.09] text-accent-deep font-bold"
              : "text-ink-soft font-medium hover:bg-ink/[0.04] hover:text-ink",
          )}
        >
          <Link href={item.href}>
            {item.active && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
            )}
            <span
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2",
                indented && "pl-3",
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
              {item.count !== undefined && (
                <span className="ml-auto font-mono text-[10.5px] font-semibold tabular-nums text-ink-faint">
                  {item.count}
                </span>
              )}
            </span>
          </Link>
        </SidebarMenuButton>
        {item.badge && (
          <SidebarMenuBadge className="rounded-full bg-accent/[0.12] text-[9px] font-bold tracking-wider text-accent-deep uppercase">
            {item.badge}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    );
  };

  const renderGroup = (
    key: string,
    label: string,
    icon: ReactNode,
    open: boolean,
    onToggle: () => void,
    children: ReactNode,
    parentActive: boolean,
  ) => (
    <SidebarMenuItem key={key}>
      <SidebarMenuButton
        onClick={onToggle}
        tooltip={label}
        className={cn(
          "rounded-lg text-[13px] transition-colors duration-150",
          parentActive && !open
            ? "bg-accent/[0.09] text-accent-deep font-bold"
            : "text-ink-soft font-medium hover:bg-ink/[0.04] hover:text-ink",
        )}
      >
        <span
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2",
            parentActive && !open ? "text-accent" : "text-ink-faint",
          )}
        >
          {icon}
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </SidebarMenuButton>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <SidebarMenuSub>{children}</SidebarMenuSub>
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarMenuItem>
  );

  const renderSubItem = (item: NavItem) => (
    <SidebarMenuSubItem key={item.href}>
      <SidebarMenuSubButton
        asChild
        isActive={item.active}
        className={cn(
          "rounded-lg text-[13px] transition-colors duration-150",
          item.active
            ? "bg-accent/[0.09] text-accent-deep font-bold"
            : "text-ink-soft font-medium hover:bg-ink/[0.04] hover:text-ink",
        )}
      >
        <Link href={item.href}>
          <span className="truncate">{item.label}</span>
          {item.count !== undefined && (
            <span className="ml-auto font-mono text-[10.5px] font-semibold tabular-nums text-ink-faint">
              {item.count}
            </span>
          )}
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="group-data-[collapsible=icon]:justify-center"
    >
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[active=true]:bg-transparent"
        >
          <div className="flex items-center gap-2.5 px-1">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_20px_rgba(0,207,124,0.35)]">
              <Sparkles className="size-[20px]" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-[15px] font-bold leading-none tracking-tight text-ink">
                Portofio
              </p>
              <p className="mt-1 truncate text-[11px] font-medium text-ink-faint">
                {tw("brandTagline")}
              </p>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {primaryItems.map((item) => renderItem(item))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            {renderGroup(
              "content",
              t("contentLibrary"),
              <FolderOpen className="size-4" />,
              contentOpen,
              () => setContentOpen((v) => !v),
              contentItems.map((item) => renderSubItem(item)),
              contentParentActive,
            )}
            {renderItem(analyticsItem)}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            {renderGroup(
              "settings",
              t("settings"),
              <Settings className="size-4" />,
              settingsOpen,
              () => setSettingsOpen((v) => !v),
              settingsItems.map((item) => renderSubItem(item)),
              settingsParentActive,
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Profile */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.04] data-[active=true]:bg-transparent">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-[12px] font-bold text-accent-deep ring-1 ring-accent/20">
                {initials}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="min-w-0 truncate text-[12px] font-medium text-ink-soft">
                  {email}
                </span>
                {isPremium ? (
                  <span className="mt-0.5 inline-flex w-max items-center gap-1 rounded-full bg-accent/12 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-accent-deep">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {tw("planPro")}
                  </span>
                ) : (
                  <Link
                    href="/dashboard/billing"
                    className="mt-0.5 inline-flex w-max items-center gap-1 rounded-full bg-ink/[0.05] px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-ink-faint transition-colors hover:bg-accent/12 hover:text-accent-deep"
                  >
                    {tw("planFree")}
                  </Link>
                )}
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOutAction}>
              <SidebarMenuButton
                type="submit"
                className="gap-2 text-ink-faint hover:bg-ink/[0.05] hover:text-danger"
              >
                <span className="flex size-4 items-center justify-center">
                  <LogOut className="size-4" />
                </span>
                <span className="truncate">{tw("logout")}</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
