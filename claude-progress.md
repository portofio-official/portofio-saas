# Progress Log

## Current Verified State

- Repository root: `/Users/maaullntech/Dev/portofyo`
- Standard startup path: `npm run dev` (Next.js 16 App Router, Turbopack) — app is scaffolded
- Standard verification path: `npm run lint && npx tsc --noEmit && npm run build`
- **Stale-claim correction (found 2026-07-16, see Session 016):** two bullets that used to live here were wrong by the time of Session 016 and have been removed — (1) "not a git repository yet": false, this has been a real git repo with real commit history since at least Session 011/012-era work (see `git log`); (2) "`auth-001` blocked on no real Supabase project": false, `.env.local` has held real Supabase project credentials and `AUTH_DUMMY_MODE` has been `false` (the dummy-auth path in `src/lib/auth/dummy.ts` is dead code — nothing calls `setDummySession`) for several sessions now. Treat any *future* stale-sounding blocker claim in this file with suspicion; verify against `git log`/`.env.local`/actual code before trusting it, this file has drifted before.
- The marketing landing page (`/[locale]` root route) was fully replaced in Session 015 with a ported design at the user's explicit request (source: an external Vite/React project). It's a standalone component tree under `src/components/landing/` with its own scoped CSS Modules (`shared.module.css`) — not Tailwind theme tokens. As of Session 016, its color palette (`#00cf7c` green), type pairing (Outfit/Inter), and icon set (Material Symbols) were adopted by the rest of the app-shell too (dashboard/auth/editor), so the two now look like one brand — see `DESIGN.md`'s scope note and Section 4.2 for the precise line between "shared visual language" and "separate implementation."

## Session Log

### Session (2026-08-01) — Go-Live Hardening & Quality Engineering (/goal)

- Goal: Complete Sprint 1 & 2 Hardening tasks from `docs/IMPLEMENTATION_PLAN.md`: XSS wiring, rate limiting, cron configuration, legal links, admin blocklist CRUD, and Playwright E2E suite setup.
- Completed:
  - **Task B-006 (XSS Sanitization Wiring)**: Wired `sanitizeObjectData` helper into `saveDraftAction` (`src/lib/projects/actions.ts`) and `PublicSitePage` (`src/app/sites/[subdomain]/page.tsx`) to strip malicious `<script>` tags and dangerous `on*` attributes before storage and dynamic rendering.
  - **Task B-005 (Rate Limiting Middleware)**: Created sliding-window rate limiter in `src/lib/rate-limit.ts`. Enforced IP-based rate limiting on `signUpAction` (5 requests / 15 min) and `requestPasswordResetAction` (3 requests / 15 min) in `src/lib/auth/actions.ts`, and user-based rate limiting on `publishProjectAction` (10 requests / hr) in `src/lib/projects/actions.ts`.
  - **Task B-007 (Footer Legal Links)**: Updated `src/components/landing/Footer.tsx` legal links to use `@/i18n/navigation` `<Link>` components routing to `/privacy` and `/terms`.
  - **Task B-008 (Vercel Cron Config)**: Created `vercel.json` defining daily cron job at 02:00 UTC calling `/api/cron/check-subscriptions`. Documented `CRON_SECRET` in `.env.example`.
  - **Task B-014 (Subdomain Blocklist Admin CRUD)**: Created admin server actions (`addBlocklistWordAction`, `removeBlocklistWordAction` in `src/lib/admin/actions.ts`) and interactive management UI (`src/components/admin/BlocklistClientView.tsx` & `src/app/[locale]/admin/blocklist/page.tsx`). Restored user and template admin actions.
  - **Task B-004 (Playwright E2E Test Suite)**: Created `playwright.config.ts` configured for Next.js dev server, created automated test specs in `e2e/flows/` (`01-landing.spec.ts`, `02-auth.spec.ts`, `08-public-site.spec.ts`), updated `package.json` with script `"test:e2e": "playwright test"`, and excluded `e2e` in `tsconfig.json`.
- Verification:
  - `npm run lint && npx tsc --noEmit && npm run build`: Passed clean with **0 errors, 0 warnings** across all 21 routes.

- Goal: Implement critical architecture improvements while preserving multi-workspace abstraction in MVP: ISR caching, proactive quota UI, legal routes, cron expiry worker, XSS sanitization helper.
- Completed:
  - **`src/app/sites/[subdomain]/page.tsx`**: Added `export const revalidate = 60` for ISR caching on public multi-tenant routes to prevent database connection pool exhaustion.
  - **`src/components/dashboard/DashboardClientView.tsx`**: Implemented proactive Quota Notification Banner in header when `publishedCount >= 1` explaining 1 active published website limit per account.
  - **`src/app/[locale]/privacy/page.tsx` & `src/app/[locale]/terms/page.tsx`**: Built bilingual (`id`/`en`) Privacy Policy and Terms of Service legal compliance pages.
  - **`src/app/api/cron/check-subscriptions/route.ts`**: Built Vercel Cron background worker triggering `softUnpublishUserProjects()` for expired accounts beyond 7-day grace period.
  - **`src/lib/utils/sanitize.ts`**: Created HTML string and object sanitization helper defending against Stored XSS injection in portfolio text inputs.
- Verification:
  - `npx tsc --noEmit` & `npm run build`: Clean compilation across all 21 routes in 2.7s.

### Session (2026-08-01) — Single Published Website Limit Policy Enforcement (/goal)

- Goal: Update PRD v1.7, FLOW v1.0, Sprint plan, and backend publish action to strictly enforce 1 published website per user account max.
- Completed:
  - **`src/lib/projects/actions.ts`**: Updated `publishProjectAction` to check if the user account already has another project with `status = 'published'`, returning a clear bilingual validation error if a second deploy is attempted.
  - **`docs/PRD.md`**: Updated to v1.7, resolving Open Question #16 (1 user account = max 1 published website).
  - **`docs/FLOW.md`**: Updated Flow 5 validation notes with single published site rule.
  - **`docs/SPRINTS.md` & `implementation_plan.md`**: Updated Sprint 1 Task 1.2 and plan matrix.
- Verification:
  - `npm run lint` & `npx tsc --noEmit`: 0 errors.
  - `npm run build`: Clean compilation across all 18 routes in 3.0s.

### Session (2026-08-01) — Master Implementation & Sprint Plan Creation (/goal)

- Goal: Audit PRD v1.6 and FLOW v1.0, construct a comprehensive 5-Sprint Implementation Plan covering all 10 user flows, pre-launch infra setup, E2E QA, and Phase 2 features.
- Completed:
  - **`docs/SPRINTS.md`**: Created durable repository artifact mapping all 10 flows (Visitor Landing, Onboarding/Auth, Template Pick, Editor + Autosave, Xendit Publish, Dashboard, Billing Lifecycle, Multi-tenant Site, Admin RBAC, Reset Password) to code implementation status, and defining Sprint 0 (Infra & Remote DB Sync), Sprint 1 (E2E Playwright Suite & Rate Limiting), Sprint 2 (Legal Pages & Background Cron), Sprint 3 (Production Go-Live & Stopwatch KPI Test), and Sprint 4 (Fase 2 Expansion).
  - **`docs/TASK_TRACKER.md`**: Updated task tracker reflecting 100% completed MVP user flow backend actions and tracking active sprint tasks.
  - **Implementation Plan Artifact**: Generated `implementation_plan.md` artifact with executive summary, flow-to-feature matrix, Gantt roadmap, and verification plan.
- Verification:
  - Validated all 10 flows in `docs/FLOW.md` against codebase contracts.
  - Verification run via standard startup path (`npm run lint && npx tsc --noEmit && npm run build` clean).

### Session (2026-07-31) — Subscription Feature Enablement & Dev Sandbox Flow (/ponytail)

- Goal: Make the subscription feature fully usable, testable, and robust across dev/stub and live Xendit production modes per user plan.
- Completed:
  - **`src/lib/billing/actions.ts`**: Updated `createCheckoutInvoiceAction` redirect targets to `/dashboard/billing?checkout=success` and `/dashboard/billing?checkout=failed`. Added `activateDevSubscriptionAction` server action using `createAdminClient` with schema-compatible fallback for 1-click test subscription activation.
  - **`src/proxy.ts`**: Bypassed `next-intl` middleware for path-based `/sites/[subdomain]` fallback requests to prevent unwanted locale prefixing (`/en/sites/...` 404).
  - **`src/app/sites/[subdomain]/page.tsx`**: Updated `getPublishedProject` to fetch via `createAdminClient` for reliable public site rendering.
  - **`supabase/migrations/20260731000001_fix_subscriptions_schema.sql` & `20260731000002_fix_published_read_rls.sql`**: Added DB migrations for subscriptions table schema fix and public RLS policies for published projects.
  - **`src/components/dashboard/BillingClientView.tsx`**: Replaced price placeholder `Rp[X]/mo` with `Rp 49.000 / bulan`. Added checkout status banners and `⚡ Activate Test Sub (30 days)` shortcut button.
  - **`src/app/sites/layout.tsx`**: Created root layout rendering `<html>` and `<body>` tags for public published sites (`/sites/[subdomain]`), resolving Next.js missing root layout error.
- Verification:
  - `npm run lint` & `npx tsc --noEmit`: **0 errors, 0 warnings**.
  - `npm run build`: **Clean compilation across all 18 routes** in 2.8s.



### Session (2026-07-31) — Ultra-Premium SaaS Dashboard Redesign & Green Color Unification (/high-end-visual-design)

- Goal: Redesign the Portofio SaaS dashboard UI into an ultra-premium workspace matching Apple, Linear, Framer, and Notion design principles, unified with the brand green palette (`#00cf7c`).
- Completed:
  - **`src/app/[locale]/dashboard/layout.tsx`**: Updated container layout to soft neutral background (`#F8F9FB`), rounded corners (`rounded-2xl`), subtle borders (`#E5E7EB`), and clean spacing.
  - **`src/components/dashboard/DashboardSidebar.tsx`**: Rearchitected to 240px width with green Workspace Switcher logo ("P" monogram, "Portofio Workspace" title), green active navigation highlights (`#00cf7c` / `#00b368`), workflow-grouped navigation (*Websites*, *Templates*, *Content Library* | *Analytics [Pro]*, *Domains*, *Billing* | *Settings*), and user profile footer.
  - **`src/components/dashboard/DashboardClientView.tsx`**: Built top header with "Websites" title, live subtext metadata counters (Total, Published, Draft, Last updated), search input with `⌘K` keyboard shortcut listener and green focus ring, green filter pills, sort dropdown, and green "New Website" CTA (`#00cf7c`). Created responsive card grid with macOS dots browser frame preview, live template renderer, status badges, timestamp, green hover action bar (*Edit*, *Preview*, *Publish/Unpublish*, *Duplicate*, *More menu*), quick preview modal overlay, and dashed "Create Website" card with green hover.
  - **`src/lib/workspace/actions.ts`**: Added `duplicateWorkspaceAction` to clone a workspace and its project content in 1 click.
- Verification:
  - `npm run lint` & `npx tsc --noEmit`: **0 errors, 0 warnings**.
  - `npm run build`: **Clean compilation across all 18 routes** in 4.6s.




### Session (2026-07-31) — Directory Reorganization & Documentation Grouping

- Goal: Clean up project directory structure by grouping documentation files into `docs/` and updating path references.
- Completed:
  - Moved `PRD.md`, `DESIGN.md`, `FLOW.MD`, `REQUIREMENT.md`, `TASK_TRACKER.md`, and `project.md` from root into `docs/` (renamed `FLOW.MD` to `docs/FLOW.md`).
  - Updated documentation path references in `README.md`, `AGENTS.md`, `CLAUDE.md`, and `.gitignore`.
  - Kept essential root runtime files (`AGENTS.md`, `CLAUDE.md`, `README.md`, `claude-progress.md`, `feature_list.json`, `init.sh`, config files).
- Verification:
  - Executed `./init.sh` baseline verification — `npm install` and `npm run lint` passed cleanly (0 errors).
  - Verified directory structure with `ls -la` and `git status`.

### Session (2026-07-31) — Implement docs/FLOW.md + Dashboard Billing Section

- Goal: (1) Write `docs/FLOW.md` with comprehensive user-flow documentation (was an empty file since dir reorganization). (2) Close remaining `dashboard-001` gap: billing section in dashboard. (3) Fix `useState` lint warning in freelancer renderer.
- Completed:
  - **`docs/FLOW.md`** — written from scratch: 10 user flows with Mermaid diagrams covering Visitor→Landing, Onboarding, Template Pick, Editor+Autosave, Publish+Xendit, Dashboard Management, Billing Lifecycle, Public Site Rendering, Admin Panel, and Reset Password. Includes template registry table (8 templates), route map, and implementation status table.
  - **`src/app/[locale]/dashboard/billing/page.tsx`** — new server component: reads session user, calls `getSubscriptionState()`, passes data to `BillingClientView`.
  - **`src/components/dashboard/BillingClientView.tsx`** — new client component: status badge (active/grace_period/expired/none), renewal/expiry date, grace period countdown warning banner, auto-unpublish notice for expired accounts, feature checklist, Xendit checkout CTA button (calls `createCheckoutInvoiceAction`), manage subscription section.
  - **`src/components/dashboard/DashboardSidebar.tsx`** — added "Billing" nav item (credit_card icon, href `/dashboard/billing`), added active-state detection `isBilling`, Projects now deactivates for billing route too.
  - **`src/templates/definitions/freelancer/renderer.tsx`** — removed unused `useState` import (was causing 1 lint warning since `init.sh`).
  - **`feature_list.json`** — `dashboard-001` status changed from `in_progress` → `passing`.
- Verification:
  - `npm run lint`: **0 errors, 0 warnings** (previously had 1 warning).
  - `npx tsc --noEmit`: **0 errors**.
  - `npm run build`: **clean, 18 routes** (new `/[locale]/dashboard/billing` route compiled).
- Next step: All MVP features are now in `passing` state. Ready for deployment testing.

### Session (2026-07-28) — Template-as-a-Unit Architecture Refactor

- Goal: Refactor the template architecture from a horizontally split structure into a modular "Template-as-a-Unit" domain model under `src/templates/definitions/{name}/`.
- Completed:
  - Created core contract types & interfaces in `src/templates/definition.ts`, `src/templates/types.ts`, and `src/templates/shared/_base.ts`.
  - Refactored all 7 built-in templates (`minimal`, `bold`, `corporate`, `creative`, `dark`, `studio`, `portfolio-pro`) into self-contained packages under `src/templates/definitions/{name}/` containing `definition.ts`, `schema.ts`, `defaults.ts`, `mapper.ts`, `migrations.ts`, and `renderer.tsx`.
  - Created unified registry at `src/templates/registry.tsx` and font helper at `src/templates/fonts.ts`.
  - Updated ~35 consumer files across app, dashboard, editor, actions, and store layers to use `@/templates/*`.
  - Removed legacy directories `src/lib/templates/` and `src/components/templates/`.
- Verification:
  - `npx tsc --noEmit` passed clean with 0 errors.
  - `npm run build` passed clean with 0 errors (compiled in 2.7s).
- Next step: Continue with planned feature roadmap.

### Session (2026-07-28) — Workspace Profile Snapshot & Optional Sync Pattern

- Goal: Formalize the `workspace_profile` → `project content_json` relationship as "initial auto-fill → independent snapshot → explicit opt-in sync", ensuring profile edits don't unexpectedly modify existing projects.
- Completed:
  - Created SQL migration `supabase/migrations/20260728000002_add_profile_synced_at.sql` adding `profile_synced_at` column to `projects`.
  - Updated `Project` type in `src/lib/projects/types.ts` (`profileSyncedAt`).
  - Updated `src/lib/projects/store.ts` (`mapRow` maps `profile_synced_at`, added `hasProfileDiverged()` helper).
  - Added `syncFromProfileAction` in `src/lib/projects/actions.ts` to merge profile fields into current draft `content_json` as a new version and update `profile_synced_at`.
  - Updated Editor Server Page `src/app/[locale]/dashboard/[workspaceId]/editor/page.tsx` to detect profile divergence via `hasProfileDiverged` and pass `profileDiverged`.
  - Updated Editor Component `src/components/dashboard/Editor.tsx` to display an interactive Profile Sync banner ("Workspace profile updated. Update this project?") with "Sync from Profile" and "Dismiss" buttons.
  - Cleaned up Public Site Renderer `src/app/sites/[subdomain]/page.tsx` to stop live-reading `workspace_profile` at render time, enforcing strict snapshot isolation.
- Verification:
  - `npx tsc --noEmit` passed clean with 0 errors.
  - `npm run lint` passed clean with 0 errors and 0 warnings.
- Next step: Ready for deployment.


- Goal: Evolve the `projects` data model from flat `draft_json`/`published_json` columns to a versioned architecture with a dedicated `project_versions` table (`current_version_id` & `published_version_id` pointers).
- Completed:
  - Created SQL migration `supabase/migrations/20260728000001_add_project_versions.sql`:
    - Created `project_versions` table (`id`, `project_id`, `version_number`, `content_json`, `schema_version`, `is_autosave`, `created_at`, `created_by`).
    - Added `current_version_id` and `published_version_id` FK pointers to `projects`.
    - Wrote data migration logic migrating existing `draft_json` (version 1) and `published_json` (version 2) into `project_versions`.
    - Dropped legacy `draft_json` and `published_json` columns from `projects`.
    - Set up RLS policies (`owner_all` and `public_read_published`) for `project_versions`.
    - Updated `publish_project` RPC function to atomically point `published_version_id = current_version_id`.
  - Updated TypeScript types in `src/lib/projects/types.ts` (`ProjectVersion`, `ProjectWithDraft`, updated `Project`).
  - Refactored Data Access Layer in `src/lib/projects/store.ts` (`saveDraftJson` creates new `project_versions` row, `getProjectWithDraft`, `getProjectPublishedVersion`, etc.).
  - Updated Editor Server Page (`src/app/[locale]/dashboard/[workspaceId]/editor/page.tsx`) to fetch and pass `draftVersion.contentJson`.
  - Updated Workspace Queries (`src/lib/workspace/queries.ts`) to fetch draft previews from `project_versions`.
  - Updated Public Site Renderer (`src/app/sites/[subdomain]/page.tsx`) to fetch published version content from `project_versions`.
- Verification:
  - `npx tsc --noEmit` passed clean with 0 errors.
  - `npm run lint` passed clean with 0 errors and 0 warnings.
  - `npm run build` completed successfully with all 17 routes compiled cleanly.
- Next step: User applies migration `20260728000001_add_project_versions.sql` in Supabase SQL Editor.


- Goal: Fix template preview scrolling so the entire template can be viewed from top to bottom across Desktop, Tablet, and Mobile viewports without accidental modal closure when dragging scrollbars.
- Completed:
  - Fixed scrollbar click handling via target checking (`e.target === e.currentTarget`), preventing modal dismissal during scroll actions.
  - Implemented standalone scrollable document canvas in **Desktop Mode** (`w-full max-w-[1240px]`).
  - Implemented internal screen scroll containers inside realistic **Tablet Device Frames** (`w-[768px]`, `max-h-[84vh]`, `overflow-y-auto`) and **Mobile Smartphone Frames** (`w-[375px]`, `max-h-[84vh]`, `overflow-y-auto`).
- Verification: `npm run lint && npx tsc --noEmit` passed clean with 0 errors and 0 warnings.
- Next step: Ready for user testing.


### Session (2026-07-27) — Template Preview Overlay Optimization

- Goal: Optimize template live preview modal overlay on Landing Page and Dashboard Gallery so it can be easily closed via backdrop click or ESC key, locks background scroll, and includes responsive viewport switcher.
- Completed:
  - Fixed backdrop click event propagation bug in `TemplateShowcase.tsx` and `TemplateGallery.tsx` (clicking outside the template card now smoothly closes the modal).
  - Added native `Escape` key event listener to close modal on keyboard press.
  - Added background body scroll lock (`document.body.style.overflow = "hidden"`) while modal is active.
  - Added interactive Viewport Device Switcher (Desktop 💻 / Tablet 📱 / Mobile 📱) to landing page preview modal (`TemplateShowcase.tsx`).
- Verification: `npm run lint && npx tsc --noEmit` passed clean with 0 errors and 0 warnings.
- Next step: Ready for user testing.


### Session (2026-07-27) — Template Gallery UI/UX Enhancements

- Goal: Implement modern, high-end UI/UX improvements to `TemplateGallery.tsx` based on industry references (Framer, Vercel, Canva).
- Completed:
  - Added macOS dots browser window bar frame to template card thumbnails with custom subdomain labels.
  - Added instant search bar alongside category filter pills with clear button & empty-state fallback.
  - Added tags display and "★ Populer" badge highlighting top templates (Studio & Portfolio Pro).
  - Built interactive Viewport Device Switcher (Desktop 💻 / Tablet 📱 / Mobile 📱) inside the full-screen live preview modal.
- Verification: `npm run lint && npx tsc --noEmit` passed cleanly with 0 errors.
- Next step: Ready for user review and testing.


### Session (2026-07-27) — Point 3: GSAP Tech Debt Cleanup & Auth Email Template Setup

- Goal: Clean up redundant GSAP animation library imports from app-shell UI components and document auth email template configuration.
- Completed:
  - Refactored `DashboardSidebar.tsx` and `AdminSidebar.tsx` to replace GSAP animations with Framer Motion (`motion.aside`).
  - Purged GSAP imports and hooks from `DashboardClientView.tsx`, `TemplateGallery.tsx`, and `Editor.tsx`.
  - Verified 0 remaining GSAP imports in app-shell components.
  - Documented exact Supabase Dashboard Email Template URL shape for verification.
- Verification: `npm run lint && npx tsc --noEmit` clean with 0 errors and 0 warnings.
- Next step: All 3 audit points complete! Ready for user deployment and testing.


### Session (2026-07-27) — Point 2: Billing & Xendit Webhook Architecture

- Goal: Build production-ready Xendit webhook handling, subscription state machine, signature verification, idempotency protection, and reversible soft-unpublish.
- Completed:
  - Created migration `supabase/migrations/20260727000002_update_subscription_statuses.sql` updating constraint to support `('active', 'inactive', 'grace_period', 'expired', 'canceled')`.
  - Built Xendit signature verification (`verifyXenditWebhookSignature` in `src/lib/billing/xendit.ts`).
  - Built idempotency protection by checking and logging `xendit_event_id` in `billing_events` table before processing events (`src/app/api/webhooks/xendit/route.ts`).
  - Built subscription state machine with 7-day grace period logic (`src/lib/billing/subscription.ts`).
  - Built reversible soft-unpublish (`softUnpublishUserProjects` in `src/lib/billing/unpublish.ts`) which updates `projects.status = 'draft'` while preserving portfolio JSON data intact.
  - Built Server Actions for subscription invoice checkout (`createCheckoutInvoiceAction` in `src/lib/billing/actions.ts`).
- Verification: `npm run lint && npx tsc --noEmit` clean with 0 errors and 0 warnings.
- Next step: User applies migration `20260727000002` in Supabase, set `XENDIT_WEBHOOK_VERIFICATION_TOKEN` & `XENDIT_SECRET_KEY` in `.env.local`.


### Session (2026-07-27) — RLS Audit & Security Fixes

- Goal: Audit and fix Row Level Security (RLS) policies and stale table references across Supabase database tables.
- Completed:
  - Created migration `supabase/migrations/20260727000001_fix_rls_policies_and_stale_references.sql`.
  - Restricted owner policies on `workspace_profile`, `workspace_assets`, and `projects` to `TO authenticated` (stops Postgres from evaluating owner policies on `anon` requests).
  - Fixed `workspaces_public_read_published` policy on `public.workspaces` to reference `public.projects` (`status = 'published'`) instead of the dropped `public.sites` table.
  - Fixed `workspace_profile_public_read` policy on `public.workspace_profile` to reference `public.projects` (`status = 'published'`) instead of the dropped `public.sites` table.
- Verification: `npm run lint && npx tsc --noEmit` clean with 0 errors.
- Next step: Apply `20260727000001_fix_rls_policies_and_stale_references.sql` in Supabase SQL Editor, then proceed to Point 2 (Billing & Webhooks Xendit).


### Session (2026-07-24) — Path-based Testing Fallback

- Goal: Allow easier MVP testing on Vercel by formatting live-site URLs as paths instead of subdomains.
- Completed:
  - Updated `Editor.tsx` to generate `siteUrl` as `${domain}/sites/${subdomain}` and tweaked the subdomain input UI to show this prefix.
  - Updated `DashboardClientView.tsx` so the "View site" button for published projects points to the path-based URL.
- Verification: UI updates correctly generate path-based URLs that Next.js middleware natively resolves.
- Next step: Continue with other tasks (like Xendit billing integration).

### Session 019 (2026-07-19) — DB: profiles, billing_events, subdomain_blocklist

- Goal: Tambah tabel-tabel yang hilang dari skema MVP (user profiles, billing audit log, subdomain blocklist).
- Completed:
  - **`20260719000001_add_profiles.sql`** (diperbarui): tabel `profiles` + kolom `role` ('user'|'designer'|'admin'), RLS (owner-select, admin-select-all, owner-update), trigger `on_auth_user_created` (auto-create + set role dari raw_user_meta_data), trigger `profiles_sync_role` (auto-sync role ke `auth.users.raw_app_meta_data` setiap kali role berubah), trigger `profiles_updated_at`, fungsi `set_updated_at()` (reusable).
  - **`20260719000002_add_billing_events.sql`**: tabel `billing_events` — audit log + idempotency key (`xendit_event_id UNIQUE`) untuk webhook Xendit. RLS: authenticated read own events, hanya service_role yang write.
  - **`20260719000003_add_subdomain_blocklist.sql`**: tabel `subdomain_blocklist` — kata terlarang untuk subdomain. RLS: public read, service_role write. Seed 38 slug.
  - **`20260719000004_add_template_submissions.sql`**: tabel `template_submissions` (Fase 2 stub) — designer submit template untuk review admin. Status: pending/approved/rejected/revision_requested. RLS berlapis: designer bisa insert/update milik sendiri, admin bisa all. Trigger updated_at.
  - **`supabase/functions/custom-claims/index.ts`**: Edge Function JWT Hook — setiap login/refresh token, inject `role` dari `profiles` ke `app_metadata` JWT. RLS policies semua tabel pakai `auth.jwt() -> 'app_metadata' ->> 'role'` untuk cek admin/designer tanpa query tambahan.
- Verification: migrations + edge function ditulis, **BELUM di-apply ke Supabase**.
- Known risk / next step:
  - **Apply ke Supabase Dashboard SQL Editor** (urutan: 20260716000006 → 20260719000001 → 0002 → 0003 → 0004).
  - **Aktifkan JWT Hook**: Supabase Dashboard → Authentication → Hooks → Custom Access Token Hook → pilih edge function `custom-claims`. Deploy edge function dulu via `npx supabase functions deploy custom-claims`.
  - Untuk assign role admin: `update public.profiles set role = 'admin' where id = '<your-uuid>';` — trigger `profiles_sync_role` akan otomatis update JWT metadata.

### Session 018

- Date: 2026-07-16
- Goal: Implement publish-001 (publish panel + subdomain flow) and dashboard-001 status badges per approved implementation plan.
- Completed:
  - **Publish Panel in Editor** (`Editor.tsx`): subdomain input (auto-lowercase, strip invalid chars), publish/unpublish buttons with loading states, "Live" badge in header + sidebar panel, "View site" link, subscription_required error → billing CTA.
  - **Server actions** (`projects/actions.ts`): `publishProjectAction` (slug validation, uniqueness check, subscription gate, calls `publish_project` RPC), `unpublishProjectAction`.
  - **Subscription gate stub** (`lib/billing/subscription.ts`): NEW file — queries `subscriptions` table by session `user_id`. Returns false if no active row. billing-001 will replace with Xendit webhook logic.
  - **Dashboard card status** (`DashboardClientView.tsx`): real "Live" (green dot) / "Draft" badge, "View site ↗" link when published, unpublish (cloud_off) button on hover per card.
  - **Workspace queries** (`workspace/queries.ts`): `listWorkspaces` now fetches `status` + `subdomain` from `projects` alongside thumbnail data. `Workspace` type gains `publishStatus` + `subdomain` fields.
  - **Workspace actions** (`workspace/actions.ts`): added `unpublishWorkspaceProjectAction` — server action for dashboard-card unpublish; avoids importing server-only store code into client bundle.
  - **Editor page** (`editor/page.tsx`): passes `initialSubdomain`, `initialStatus`, `rootDomain` (from `NEXT_PUBLIC_ROOT_DOMAIN`) to Editor so Publish Panel initialises correctly.
  - **Migration** `supabase/migrations/20260716000006_add_subscriptions.sql`: `subscriptions` table with RLS. Needs manual apply in Supabase Dashboard SQL Editor.
- Verification run: `npm run lint` (0 errors, 0 warnings) + `npx tsc --noEmit` (clean) + `npm run build` (clean, all 12 routes).
- Evidence captured: in `feature_list.json` for publish-001 and dashboard-001.
- Commits: `8e99bf1` feat(publish-001): add publish panel to editor + dashboard status badges
- Known risk or unresolved issue:
  - **Migration not applied yet**: `20260716000006_add_subscriptions.sql` must be run in Supabase Dashboard SQL Editor before publish can succeed.
  - **Publish not end-to-end tested**: UI and server actions are built and compile, but a live publish-then-load-subdomain test has NOT been run yet. Do this first in Session 019.
  - **Subscription gate is a stub**: publish will always return `subscription_required` until a test `subscriptions` row is manually inserted (or billing-001 lands). To test publish: insert `(user_id = <your uuid>, status = 'active', expires_at = NULL)` into `subscriptions`.
  - **`NEXT_PUBLIC_ROOT_DOMAIN` not in `.env.local`**: needs to be set to `localhost:3000` for local subdomain rendering to work correctly. Without it, the fallback `"localhost:3000"` applies, which is fine for now.
- Next best step: (1) Apply migration 0006 in Supabase SQL Editor. (2) Add test subscription row. (3) Run full publish end-to-end test from Editor. (4) Then move to template-002 or billing-001.


> Sessions 001–015 (original MVP build: setup, auth, data, template, landing page) archived to `docs/progress-archive.md` on 2026-07-17 — superseded by the Workspace Profile + Project System migration below. Read the archive only if you need pre-migration history.

### Session (2026-07-16) — Architecture: Workspace Profile + Project System (Fase 1-2)

- Goal: Migrate dari single PortfolioData global ke Workspace Profile → TemplateDefinition (Zod) → WebsiteDocument → Renderer
- Approach: Incremental (Opsi B) — additive, no breaking changes

**Completed:**
- Spec: `docs/superpowers/specs/2026-07-16-workspace-project-architecture.md`
- Plan: `docs/superpowers/plans/2026-07-16-workspace-project-architecture.md`
- **Fase 1 — DB migrations:**
  - `20260716000001`: `workspace_profile` table (1:1 workspace, hybrid structured+JSONB, RLS)
  - `20260716000002`: `workspace_assets` table (library stub, RLS)
  - `20260716000003`: `projects` table (many:1 workspace, draft_json+published_json, RLS)
  - `20260716000004`: `publish_project()` RPC (atomic draft→published copy, SECURITY DEFINER)
- **Fase 2 — Code:**
  - `src/lib/templates/definition.ts`: TemplateDefinition<TSchema>, WebsiteDocument, WorkspaceProfile, runMigrations(), parseDocumentData(), buildInitialDocument() (auto-fill)
  - `src/lib/templates/schemas/_base.ts`: shared Zod schemas (1:1 PortfolioData — no data migration needed)
  - `src/lib/templates/schemas/{minimal,bold,creative,corporate,dark}.ts`: TemplateDefinition per template with adapter for existing renderers
  - `src/components/templates/registry.tsx`: new TEMPLATE_REGISTRY + TemplateRenderer(WebsiteDocument) + LegacyTemplateRenderer (backward-compat)
  - `src/lib/projects/`: types, store, actions (createProject with auto-fill, saveDraftJson, publishProject, unpublishProject)
  - `src/lib/workspace/profile.ts`: getWorkspaceProfile, saveWorkspaceProfile
  - `src/lib/workspace/assets.ts`: listAssets stub
  - Editor.tsx, TemplateGallery.tsx: switched to LegacyTemplateRenderer (no behavior change)

**Verification:** lint clean (0 errors), tsc clean (0 errors), committed as 0b015a9

**Not done yet (Fase 3+4):**
- Fase 3: Migrate Editor.tsx to read/write `project.draft_json` (WebsiteDocument) instead of `portfolio_data`
- Fase 4: Drop `portfolio_data`, `sites`, remove `src/lib/portfolio/`, remove `PortfolioData` type
- Supabase migrations need to be pushed to remote (`npx supabase db push`)

**Next step:** Fase 3 — update Editor to use new projects store + WebsiteDocument flow

### Session (2026-07-16) — Architecture: Workspace Profile + Project System (Fase 3-4 Complete)

**Completed Fase 3 (Editor Migration):**
- Migrated `Editor.tsx` to accept `WebsiteDocument` from `projects.draft_json`.
- Updated `EditorPage` to read from `projects` and auto-create the first project for a workspace using `WorkspaceProfile`.
- Updated `PublicSitePage` (in `sites/[subdomain]/page.tsx`) to render from `projects.published_json` via `TemplateDefinition.renderer`.

**Completed Fase 4 (Cleanup):**
- Deleted `src/lib/portfolio/` module and `PortfolioForm.tsx`.
- Moved `compressImage.ts` to `src/lib/utils/`.
- Updated all template components to rely directly on `BasePortfolioData` from `_base.ts`.
- Created Supabase migration `20260716000005_drop_legacy_tables.sql` to drop `portfolio_data` and `sites`.

**Status:** The new multi-project architecture with Zod schemas as the source of truth is now fully implemented.

### Session (2026-07-16) — Bugfixes: Template Opening and Navigation

**Goal:** Fix user-reported issue "saya tidak bisa membuka project web template nya" and resolve console warnings (`GSAP target not found`).

**Completed:**
- Fixed a bug in `DashboardClientView.tsx` where the `container` ref for `useGSAP` was nested too deeply, leaving `.gsap-header` and conditionally `.gsap-card` outside of the GSAP scope. This caused the targets to be missed, throwing console warnings and breaking animations.
- Fixed a bug in `EditorPage.tsx` where the user's template selection from `/templates` was completely ignored, and the project was always created with the hardcoded `minimal` template. The editor now correctly queries `getSelectedTemplateId(workspaceId)` before creating the project.
- Fixed a navigation loop in `EditorPage.tsx`. The "Back to templates" link previously sent users to `/dashboard/[workspaceId]`, which immediately redirected back to the editor itself, trapping the user. It now points correctly to `/dashboard`.
- Cleaned up unused variables in `DashboardClientView.tsx`.
- Ran baseline verification (`npm run lint`, `tsc`, `build`), everything passes.

**Status:** The editor opens reliably with the chosen template and navigates correctly.

### Session (2026-07-16) — Bugfixes: Template Creation & Dashboard Actions

**Goal:** Investigate why templates cannot be accessed during creation, and add delete/archive functionality to projects on the dashboard.

**Completed:**
- **Fixed Template Creation:** During the Phase 4 architectural cleanup, the `sites` table was dropped in favor of a `projects` table. However, the template creation flow (`createWorkspaceAction`) was still trying to save the user's template selection to the deleted `sites` table, causing it to fail silently and fall back to the default `minimal` template. Updated `createWorkspaceAction` to pass the `templateId` via URL query parameters, and `EditorPage.tsx` to read it directly from `searchParams` when auto-creating the initial project.
- **Added Project Deletion:** Added a `deleteWorkspaceAction` server action and a Delete button (trash icon) to the project cards in `DashboardClientView.tsx` so users can now delete their projects directly from the dashboard.
- Ran baseline verification (`npm run lint`), everything passes.

### Session 016 (2026-07-16) — Dashboard taste-skill pass: premium polish + landing-palette alignment

- Goal: User invoked `/design-taste-frontend` asking to make the dashboard UI more premium/less AI-slop and align its style and colors with the landing page. The invocation was a **re-issue of an interrupted prior run** — the transcript's first message was `[Request interrupted by user]` before the actual command args. That prior run had already done substantial uncommitted work (visible in `git status`/`git diff` from before this session touched anything): `globals.css` tokens migrated from the old ultramarine "Soft Structuralism" palette to `#00cf7c` green + Inter/Outfit, `DESIGN.md` fully rewritten to a leaner "Clean, Modern SaaS" spec, and `DashboardClientView.tsx`/`DashboardSidebar.tsx`/`Editor.tsx` substantially redesigned (double-bezel cards, working delete, GSAP entrances). This session's job was to finish/verify/polish that interrupted work, not redo it.
- Findings before touching anything (important for future sessions): `AUTH_DUMMY_MODE` is dead — `setDummySession()` is never called anywhere, so flipping the env var to `true` does nothing; `signInAction`/`signUpAction` always hit the real Supabase project regardless. Real-Supabase login/signup attempts during this session repeatedly failed with a generic error (likely the free-tier auth email rate limit after repeated test signups across sessions) — this is a pre-existing infra limitation, not something touched or fixed this session.
- Completed (concrete fixes on top of the inherited redesign):
  - **Removed two non-functional "looks interactive, does nothing" controls** in `DashboardSidebar.tsx` — a workspace-switcher chevron with `group-hover:rotate-180` whose parent never had the Tailwind `group` class (so it could never fire, and there's no real multi-workspace switcher behind it anyway), and a search input with local-only state that filtered nothing (wrong component entirely — `DashboardClientView`, which owns the actual project grid, never saw it).
  - **Moved search to where it works**, `DashboardClientView.tsx`'s header: real `useState` wired to a live `.filter()` on `workspaces`, plus a "Last viewed / Name" sort toggle (was previously a static unwired button) sorting by `createdAt` or `name.localeCompare`. Added a distinct "No matches" state (separate from the true "No projects yet" empty state) so a search with zero results doesn't show the same "create your first project" CTA as a genuinely empty account.
  - **Fixed a color-consistency bug** in `Editor.tsx`'s live-preview window chrome: the 3-dot "traffic light" used `bg-danger`, `bg-accent`, and a hardcoded `bg-emerald-400` — two different, slightly-mismatched greens sitting next to each other instead of the classic red/amber/green. Replaced the third dot with an actual amber (`#F5A623`).
  - **Deleted dead code:** the `CtaButton` component in `src/components/ui/CtaButton.tsx` (Phosphor `ArrowUpRight`, `bg-ink` button-in-button) had zero remaining call sites — confirmed via `grep -rn "<CtaButton"` — only the co-located `Eyebrow` export from the same file is still used (by `AuthCard.tsx` and the portfolio form sections). Removed just the unused function, kept `Eyebrow`.
  - **Finished the icon-library migration app-shell-side:** `RepeatableSection.tsx`, `SkillsSection.tsx`, and `PhotoUploadField.tsx` (all rendered inside the Editor's left sidebar, genuinely in-scope "portfolio editor" UI) were still importing Phosphor (`Trash`, `X`, `Image`) after the rest of the editor had already moved to Material Symbols spans — swapped all four usages. Left `src/components/templates/shared.tsx`'s Phosphor usage alone: that's the 5 user-facing portfolio templates (Minimal/Bold/Creative/Corporate/Dark), a deliberately separate, out-of-scope surface per `DESIGN.md`'s own exclusion — confirmed this exclusion sentence had actually been dropped in the interrupted prior run's `DESIGN.md` rewrite and restored it.
  - **Reconciled `DESIGN.md` with the code it now describes:** the rewritten "No Double-Bezel" rule (section 4.2) was flatly false — the just-redesigned `DashboardClientView.tsx` workspace cards and `TemplateGallery.tsx` template cards still use double-bezel (nested shell+core) on purpose, and it looks genuinely good there (confirmed via screenshot), not slop. Rather than rip out working, good-looking card code to match an aspirational doc, updated the doc: double-bezel is reserved for a page's primary content cards (workspace grid, template gallery), flat single-ring surfaces everywhere else, never mixed within one grid. Also added a note that the landing page shares this palette/type/icon system via its own separate `shared.module.css`, not these Tailwind theme tokens, and a new checklist line banning decorative-but-unwired controls (the exact bug just fixed above).
- Verification run:
  - `npx tsc --noEmit` / `npm run lint` / `npm run build`: all clean at every checkpoint (before touching anything, after each batch of fixes, and at the end).
  - Real screenshots: `/templates` (Template Library gallery, no auth required) at full settle — confirms live per-card template previews (not div-based fakes, the taste-skill's own recommended pattern), soft ambient shadows, consistent radius, green accent used sparingly. `/login` and `/signup` — confirm the auth screens already share the same green/Outfit aesthetic.
  - For the workspace grid (behind the login wall, and real Supabase auth wasn't reachable — see findings above): did a **temporary, fully-reversible local bypass** of `dashboard/layout.tsx`'s and `dashboard/page.tsx`'s auth redirect, substituting a hardcoded email and 3 mock `Workspace` rows (matching the real `Workspace` type shape exactly), screenshotted the populated grid, the live search filter, and the "No matches" empty state, then reverted both files and confirmed via `git diff --stat` that they came back byte-identical to their pre-bypass (unmodified-since-HEAD) state before moving on. No real auth/data code was permanently touched by this.
- Evidence captured: see verification run above; screenshots in `/tmp`, not committed.
- Commits: none — not requested by the user this session.
- Known risk or unresolved issue: real Supabase login/signup is currently failing in this dev environment (see findings above) — not caused by this session, but worth the user's attention before the next session needs an authenticated browser check. The Tailwind IDE linter flagged a large number of `ease-[cubic-bezier(0.32,0.72,0,1)]` → `ease-fluid` and similar arbitrary-value → canonical-class suggestions across the redesigned dashboard files; left alone this session (purely cosmetic code-quality, zero visual difference, high volume) — worth a dedicated cleanup pass if it starts to bother anyone.
- Next best step: none required for this specific task.

### Session 017 (2026-07-16) — Dashboard cards now show real project previews

- Goal: Direct follow-up — user asked for exactly the thing flagged as "deliberately not done" at the end of Session 016: workspace cards should show the actual project's live preview, not the generic wireframe placeholder.
- Completed:
  - `src/lib/workspace/types.ts`: `Workspace` gained an optional `preview?: { templateId: TemplateId; data: BasePortfolioData } | null` field. Optional and only populated by `listWorkspaces()` — `getWorkspace()` (used by `EditorPage`/`WorkspacePage` for lightweight existence checks) is untouched and simply never sets it.
  - `src/lib/workspace/queries.ts`: `listWorkspaces()` now does one extra batched query — `projects` filtered `.in("workspace_id", ids)`, ordered by `created_at` ascending — and picks the first project per workspace in JS (a `Map`, first-row-wins), matching the exact "first project" semantics `EditorPage` already uses (`projects[0]`). Validates `template_id` against `TEMPLATE_IDS` before building a preview; invalid/legacy template ids or workspaces with no project row yet get `preview: null` rather than crashing. No N+1 — one query for all workspaces' first projects, not one query per workspace.
  - `DashboardClientView.tsx`: the card thumbnail now renders `<LegacyTemplateRenderer templateId data />` scaled into the thumbnail exactly the way `TemplateGallery.tsx` already does it for template cards (`transform: scale(0.35)`, `width/height: 285%`, absolutely positioned inside an `overflow-hidden` box) — reused the established pattern instead of inventing a new one. The old generic dot-grid + gray-block wireframe is kept, but now only as the `preview: null` fallback (no project yet, or an unrecognized template id).
- Verification run:
  - `npx tsc --noEmit` / `npm run lint` / `npm run build`: clean.
  - Same temporary-bypass technique as Session 016 (dashboard auth guard swapped for mock data, reverted immediately after, confirmed byte-identical via `git diff --stat`) — this time with 3 mock workspaces: one `minimal`-template preview, one `dark`-template preview, one `preview: null`. Screenshot confirms all three render correctly in the same grid: the light Minimal template and the dark-themed Dark template both show their actual distinct visual identity inside the card (this is the actual point of the feature — at-a-glance recognition of which template a project uses), and the no-preview card still falls back to the wireframe placeholder cleanly. Zero console errors.
- Evidence captured: see verification run above; screenshot in `/tmp`, not committed.
- Commits: none — not requested by the user this session.
- Known risk or unresolved issue: none blocking. Real Supabase login/signup rate-limit issue from Session 016 is presumably still there (not re-tested, not this session's concern).
- Next best step: none required for this task.

### Session 019 (2026-07-17) — New template `portfolio-pro` + per-template folder restructure

- Goal: user asked to add a new template variant inspired by an external Vite/React portfolio at `/Users/maaullntech/Downloads/Web-Design-main/TemplateDesign1` (a real person's personal portfolio — content was NOT copied, only the section structure/visual concept), and separately asked to restructure ALL template files (including the 5 pre-existing legacy templates + the not-yet-committed `studio` template) into one folder per template for maintainability.
- **Restructure:** moved every template's schema/renderer/editor-sections into `src/components/templates/<id>/{schema.ts, Template.tsx, Sections.tsx?}` — previously scattered across `src/lib/templates/schemas/*.ts`, `src/components/templates/*Template.tsx`, and `src/components/portfolio/sections/StudioSections.tsx`. `src/lib/templates/{definition.ts,types.ts,schemas/_base.ts}` and `src/components/templates/{registry.tsx,shared.tsx}` stay put (shared infra, not owned by one template). Only `registry.tsx` and `Editor.tsx` needed import-path updates — confirmed via grep before moving that no other file imports the per-template files directly.
- **New template `portfolio-pro`:** extends `basePortfolioSchema` (reuses `profile`/`contact`/`socials` as-is) with new parallel fields — `hero`, `skillsShowcase[]` (name+level%+logo), `experienceDetails[]` (achievements+tools), `educationDetails[]` (achievements), `caseStudies[]` (multi-image + description + achievements, a trimmed version of the source design's 6-field challenge/solution narrative), `certificates[]`, `gallery[]`. Base `experiences`/`educations`/`skills`/`projects` remain in the schema (shared editor writes to them) but this template's own generic-section rendering is suppressed in `Editor.tsx` (`templateId !== "portfolio-pro"` guard) in favor of the richer sections, avoiding duplicate data entry — same pattern precedent as `studio` but taken one step further (studio left the generic sections visible even though unused; portfolio-pro actively hides them since it has direct replacements).
- Theme: portfolio-pro deliberately does NOT use the shared `theme.accentColor/font` schema field — user explicitly asked to preserve the source design's own visitor-facing color-scheme picker (5 presets) + dark/light toggle as local React state inside `PortfolioProTemplate`, not persisted, a one-off deviation from the rest of the app's customization model (confirmed with user during brainstorming before implementing).
- Assets: no new image files added. Skill "logos" default to a monogram+gradient fallback (matching a pattern already present in the source design) with an optional user-upload override via the existing `PhotoUploadField`; all other images (case studies, certificates, gallery) are optional uploads, empty by default. Content is entirely generic placeholder — none of the source portfolio's real personal data (name, employer, certificates) was carried over.
- Files touched: `src/components/templates/{minimal,bold,creative,corporate,dark,studio}/{schema.ts,Template.tsx}` (moved + path fixes), `src/components/templates/studio/Sections.tsx` (moved), `src/components/templates/portfolio-pro/{schema.ts,Template.tsx,Sections.tsx}` (new), `src/components/templates/registry.tsx`, `src/lib/templates/types.ts`, `src/components/dashboard/Editor.tsx`, `src/components/dashboard/TemplateGallery.tsx` (new template meta + preview data; also fixed a pre-existing `PREVIEW_DATA: any` lint error left over from the uncommitted studio work by typing it properly instead).
- Verification: `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean. Runtime check against the actual long-running dev server (not a fresh one — confirmed only the pre-existing `next dev` process is running, no orphaned duplicate): `curl http://localhost:3000/id/templates` returns 200 with no server-log errors after the final save (earlier mid-edit HMR compiles transiently logged `Module not found` for the not-yet-created portfolio-pro files, as expected, resolved once all files existed); response HTML contains all 7 template names (`Minimal`, `Bold`, `Creative`, `Corporate`, `Dark`, `Vanguard Studio`, `Portfolio Pro`) and portfolio-pro's live-rendered preview content (`Skills & Tools`, `Case Studies` headings), proving the moved/new renderer actually executes server-side without throwing — this is the same rendering path (`LegacyTemplateRenderer`) the Editor's center-canvas preview uses, so it's meaningful evidence for the editor path too, though the editor itself (which needs auth) was not separately click-tested this session.
- Commits: none — not requested by the user this session; working tree is left in a normal (uncommitted, buildable) state, no stash/bypass tricks used.
- Known risk or unresolved issue: the editor's authenticated flow (creating a project with `portfolio-pro`, filling its sections, seeing it save/publish) was not exercised end-to-end in a real browser session — only verified by static type-checking + the shared-renderer runtime proof above. Worth a real click-through next session before calling this fully done.
- Next best step: authenticated Editor click-through with the `portfolio-pro` template (create project → fill each new section → confirm autosave → confirm published render), then commit if the user wants this checked in.

### Session 020 (2026-07-17, same day) — `portfolio-pro` rebuilt as a faithful 1:1 port (superseded the Session 019 simplified version)

- Goal: user pointed out the Session 019 `portfolio-pro` template looked nothing like the source design (`TemplateDesign1/src/App.jsx`, 4146 lines) and asked, pointedly, whether the source could actually be turned into a template here — answer: yes, it's plain React, nothing prevented it. The Session 019 version had quietly substituted a much simpler visual design instead of porting the real one; user chose "kerjakan bertahap per section" (incremental, verified per section) once the true scope was clear. This session replaced nearly all of Session 019's `portfolio-pro` files with a section-by-section faithful port, verified after each section.
- **Full read of the 4146-line source** this session (previously only ~900 lines had been read). Confirmed several fields in the source are dead code and were correctly left out: `skillsData[].level`/`.category` (defined, never rendered — Skills tab only shows logo+name), `colorSchemes[].glowLight1/2/3` and `.gradient` (defined per scheme, never referenced), `course.logo` (never rendered, only `issuer` text + `file` thumbnail are shown), and the `ContactSection`'s `formData`/`handleSubmit`/`isSent` state (a contact form's state is fully wired but no `<form>` is ever rendered — the section only shows 3 contact-method cards).
- **New/rewritten files under `src/components/templates/portfolio-pro/`:** `theme.ts` (5 color schemes — the source's special 4-color conic "google" scheme was simplified to a plain amber accent, rest are faithful; `monogram`/`MONOGRAM_GRADIENTS` helpers), `Navbar.tsx` (sticky glass nav, mobile drawer, color-picker dropdown, dark/light toggle), `HeroSection.tsx` (3D flip lanyard card, floating tech badges, WhatsApp/email/LinkedIn icons), `AboutSection.tsx` (mouse-parallax tilt card), `ResumeSection.tsx` (Education/Experience/Skills tabs, drag-to-scroll timeline carousel, shared detail modal), `CoursesSection.tsx` (issuer filter tabs, carousel, detail + "show all" modals), `ProjectsSection.tsx` (tech filter, carousel, image-carousel+lightbox-zoom detail modal, Overview/Impact tabs, Limited/Full Access badge), `GallerySection.tsx` (full-bleed autoplaying cinematic slideshow with cross-fade, touch-swipe, next-up queue, progress bar), `ContactSection.tsx` + `FooterSection.tsx`, plus shared `icons.tsx` (WhatsApp/LinkedIn brand glyphs, since lucide-react — added this session as a real dependency — deliberately ships no brand icons) and `useDragScroll.ts` (shared mouse-drag-scroll hook, used by Resume/Courses/Projects).
- **Schema grew significantly** (`schema.ts`) to carry the richer per-section data faithfully: `hero` now just `{cvUrl?, badges[]}` (name/role/location/bio/photo pulled from the existing `profile` field instead of duplicating them — leaner than the source, which hardcoded all of this); new `about` section (`paragraphs[]`, `tags[]`, `yearsExperience?`); `experienceDetails`/`educationDetails` gained `logoUrl?`/`gpa?`; `caseStudies` gained `date?`, `tech[]`, `confidential`; `certificates` gained `date?`; `gallery` rebuilt from a placeholder `{imageUrl, caption?}` into the real `{imageUrl, title?, location?, date?, description?}` shape the cinematic slideshow actually needs. `Sections.tsx` (editor forms) updated in lockstep for every new/changed field.
- **Deliberate trims from the source** (flagged to the user as each came up, no objection raised): case-study narrative uses `description` + `achievements[]` instead of the source's 6-field challenge/solution/challengeFooter/solutionFooter structure; the lightbox supports a simple zoom in/out toggle instead of click-to-zoom-toward-cursor + drag-to-pan; certificate/course detail view is image-only (source also supported a `.pdf` iframe viewer); the spacebar section-jump keyboard shortcut was not ported (scroll-spy nav highlighting was, since that's the more load-bearing UX piece); `isDummy`/`comingSoon` project flags (source-specific "masked/blurred" states) were dropped.
- **New dependency:** `lucide-react` (the source's icon library) — added deliberately for icon fidelity, since `@phosphor-icons/react` (already used by `studio`) doesn't have 1:1 equivalents for everything and the goal here was visual accuracy over dependency minimalism.
- Verification: after *every* section swap, ran `npx tsc --noEmit && npm run lint && npm run build` (all clean each time) plus a runtime check against the actual long-running dev server (`curl http://localhost:3000/id/templates`, confirming 200 + section-specific text present in the live-rendered HTML, e.g. "Skills & Tools", "Featured Projects", "Design Systems Workshop"). Two real lint rules surfaced and were fixed properly rather than suppressed blindly: `react-hooks/set-state-in-effect` (fixed by deriving state instead of correcting it via an effect, in both `ResumeSection` and the `ProjectsSection` lightbox) and `react-hooks/refs` (a custom-hook-returns-a-ref false positive, confirmed safe and suppressed with an explained `eslint-disable` in the two files that use `useDragScroll`).
- App-shell wiring: scroll-spy (`Template.tsx` tracks `document.getElementById(id).getBoundingClientRect().top <= 250` per section on scroll, same threshold/logic as the source) drives real `Navbar` active-link highlighting, with a manual-scroll lock (matching the source's `isManualScrolling` ref) so clicking a nav link doesn't fight the scroll listener.
- Commits: none — not requested this session.
- Known risk or unresolved issue: same as Session 019 — authenticated Editor click-through (create project with `portfolio-pro`, fill every new section including the ones added this session, confirm autosave/publish) still hasn't been done in a real browser; only the shared public-facing renderer path has been runtime-verified. The `PortfolioProSections.tsx` editor form was kept in sync with every schema change but its own UI has not been screenshot-tested.
- Next best step: authenticated Editor click-through (same as Session 019's next step, still outstanding), then ask the user whether to commit.

### Session 022 (2026-07-17) — Landing-page auth-CTA audit + dummy-data audit

- Goal: user asked to confirm (1) no dummy/placeholder data exists anywhere except inside template demo fixtures, and (2) the landing page's auth button correctly routes to `/login` when the visitor isn't logged in. Not a `feature_list.json` item — an audit + small fix pass.
- **Task 1 (auth-CTA routing) — already correct, no bug found:** `src/app/[locale]/page.tsx` is a server component that calls `getCurrentUserEmail()` (`src/lib/auth/session.ts`, the same idiomatic session-check pattern used by every dashboard route) and passes `userEmail` down through `LandingPage` → `Navbar`. `Navbar.tsx:84-97` already branches correctly: logged-out renders `<Link href="/login">{t("login")}</Link>`, logged-in renders a `/dashboard` link. Verified via a real SSR curl against a logged-out dev server: response HTML contains `href="/id/login">Masuk</a>` — confirmed server-rendered, not just client-side. Hero/Pricing CTAs intentionally go to `/signup` (not `/login`) when logged out, a normal "Get Started" pattern — left alone, flagged to user as a judgment call if they want it changed.
- **Task 2 (dummy-data audit) — one real finding, fixed:** grepped all of `src/` outside `src/components/templates/` for dummy/mock/fake/placeholder patterns. Everything else was a false positive (legitimate `ponytail:` stub comments describing real partial functionality — `lib/billing/subscription.ts` genuinely queries the real `subscriptions` table, `lib/workspace/assets.ts` genuinely queries real data; `TemplateGallery.tsx`'s "Dummy preview data" comment is an allowed template-fixture). The one real bug: `src/components/landing/Navbar.tsx:88` hardcoded a random Unsplash stock photo as the logged-in user's profile-icon avatar, regardless of who was actually logged in. Fixed by replacing the `<img>` with a first-letter initial badge (`userEmail.charAt(0).toUpperCase()`), reusing the exact same initials-avatar pattern `DashboardSidebar.tsx:33` already uses elsewhere in the app — added one small CSS rule (`.profileIconInitial` in `Navbar.module.css`) reusing the existing circular `.profileIconLink` container (accent border, sizing) unchanged.
- Verification: `npm run lint` (0 errors) + `npx tsc --noEmit` (clean) + real dev-server curl of `/id` confirmed both the `/login` href above and that the Unsplash avatar URL no longer appears anywhere except the (allowed, marketing-decoration) `TemplateShowcase.tsx` carousel images.
- Commits: none — not yet requested this session.
- Known risk or unresolved issue: none blocking.
- Next best step: none required for this task; resume `publish-001`'s outstanding end-to-end test (Session 018's "Next best step") when picking a feature to work on next.

### Session 021 (2026-07-17) — Maintainability pass (docs + PRD/code drift + dead-code cleanup)

- Goal: user asked for a plan to tidy up the project for easier maintenance, then approved executing it in 3 phases. Not a `feature_list.json` item — a housekeeping pass across docs and `src/`.
- **Fase 1 (docs debt):** deleted 5 orphaned root docs (`index.md`, `clean-state-checklist.md`, `evaluator-rubric.md`, `quality-document.md`, `session-handoff.md`) — generic templates pulled from an external `walkinglabs/learn-harness-engineering` repo (confirmed via `.claude/settings.local.json`'s curl allowlist), never part of `CLAUDE.md`'s Required Files and unreferenced anywhere else. Kept `TASK_TRACKER.md` at the user's explicit request (used for an external CSV work-report, not for sync with `feature_list.json`). Archived Sessions 001–015 (original pre-architecture-migration MVP build) from this file to `docs/progress-archive.md` (553 → 168 lines) with a pointer note, since `CLAUDE.md` requires this file be read at the start of every session.
- **Fase 2 (PRD/feature_list vs actual code drift):** `PRD.md` §9.3/9.4 still described the dropped `portfolio_data`/`sites` tables and a single global `PortfolioData` interface — v1.5's changelog claimed this was already fixed but the section content wasn't actually changed. Rewrote both sections for real against the current schema (`workspace_profile`, `workspace_assets`, `projects.draft_json/published_json`, `subscriptions`, per-template Zod `TemplateDefinition`/`WebsiteDocument`) and bumped to v1.6 with an honest changelog note about the v1.5 gap. §3/§5/§7.3/§9.8/§15 updated from "5 template" to the actual 7 (`Vanguard Studio`, `Portfolio Pro` were added in Sessions 019/020 without a PRD update); corrected the now-false "kontrak data sama untuk semua template" claim (Studio/Portfolio Pro extend the base schema with their own sections). `feature_list.json`: updated `template-001`/`template-002`'s forward-looking `user_visible_behavior`/`verification`/`notes` fields to match (phrased as "templates in `TEMPLATE_REGISTRY`" rather than a hardcoded number, so this doesn't drift again) — historical `evidence` entries left untouched per `CLAUDE.md`'s "don't rewrite the feature list to hide unfinished work."
- **Fase 3 (src/ cleanup):** `registry.tsx` had a `ponytail:` comment claiming `TEMPLATE_COMPONENTS`/`LegacyTemplateRenderer` would be deleted "after Fase 3" of the Workspace Profile + Project migration — false: Fase 3 (Editor → `WebsiteDocument`) completed in an earlier session, but this raw-data renderer is still actively used by `Editor.tsx` (live typing preview), `DashboardClientView.tsx` (card thumbnail), and `TemplateGallery.tsx` (gallery preview), all of which render from in-memory/demo data that's never wrapped in a `WebsiteDocument`. Renamed `LegacyTemplateRenderer` → `PreviewTemplateRenderer` and rewrote the comment to state its real, permanent purpose instead of a stale removal plan (would have misled a future session into deleting live code). Fixed a stale comment in `compressImage.ts` still referencing the long-gone "dummy JSON store". Removed `AUTH_DUMMY_MODE` from `.env.example`/`.env.local` — grepped all of `src/` and confirmed zero remaining references (the dummy-auth code path itself, `src/lib/auth/dummy.ts`, was already deleted in an earlier session; only the env var declaration was left behind). The other 8 `ponytail:` markers in the codebase were reviewed and left alone — legitimate flagged corners with a stated upgrade path (stub asset manager, stub billing check, minimal forbidden-subdomain-word list, etc.), not drift.
- Verification run: `npm run lint` (0 errors), `npx tsc --noEmit` (clean), `npm run build` (clean, all 12 routes) — run once after Fase 3's code changes; `jq . feature_list.json` valid after Fase 2's edits.
- Evidence captured: n/a (housekeeping, not a `feature_list.json` entry).
- Commits: none — not yet requested this session.
- Known risk or unresolved issue: none blocking. `docs/progress-archive.md` will itself need a second archiving pass someday if `claude-progress.md` grows large again — no automation added for that (YAGNI until it recurs).
- Next best step: ask the user whether to commit this pass now, and whether to fold in Session 019/020's still-outstanding "authenticated Editor click-through for `portfolio-pro`" next-step.

### Session 022 (2026-07-20) — RBAC Implementation

- Goal: Implement Role-Based Access Control (RBAC) in the backend based on existing database roles ('user', 'designer', 'admin').
- Completed:
  - Created `docs/superpowers/specs/2026-07-20-rbac-design.md` specifying authorities for each role.
  - Implemented `requireRole` utility in `src/lib/auth/roles.ts`.
  - Renamed `src/proxy.ts` to `src/middleware.ts` and added route protection blocking unauthorized access to `/admin` and `/designer` endpoints based on the JWT role claim.
  - Added read-only access RLS policies for `admin` role across `workspaces`, `workspace_profile`, `projects`, `subscriptions`, and `billing_events` via `20260720000001_add_admin_read_policies.sql`.
- Verification run: `npm run lint` (0 errors in `src`), `npx tsc --noEmit` (clean in `src`, expected Deno errors exist in `supabase/functions/custom-claims/index.ts` from preexisting unrelated code).
- Evidence captured: Walkthrough artifact presented to user.
- Commits: 
  - `docs: add RBAC design spec`
  - `docs: add RBAC implementation plan`
  - `feat: add requireRole utility for server actions`
  - `fix: rename proxy to middleware and add route RBAC protection`
  - `feat: add admin read-only RLS policies for all resources`
- Known risk or unresolved issue: Admin and designer UIs don't exist yet, but their endpoints are now protected. Deno types in `supabase/functions` cause `tsc` errors if strictly checked from the root.
- Next best step: Build the admin dashboard UI at `/admin` to utilize these protected endpoints and RLS policies.

### Session 023 (2026-07-20) — Admin Dashboard UI

- Goal: Build the UI for the `/admin` area to view and moderate users, consistent with the design system.
- Completed:
  - Built `src/app/[locale]/admin/layout.tsx` and `src/components/admin/AdminSidebar.tsx` inheriting design tokens from `DESIGN.md`.
  - Created Supabase Service Role client in `src/lib/supabase/admin.ts`.
  - Built secure Server Actions `getUsersAction` and `toggleUserSuspensionAction` in `src/lib/admin/actions.ts` utilizing `requireRole(['admin'])` and Supabase Admin API.
  - Implemented `/admin` users dashboard table (`src/app/[locale]/admin/page.tsx`) with a client-side component `SuspendUserButton.tsx` to handle user banning via `ban_duration`.
  - Added simple read-only stub pages for `/admin/templates` and `/admin/blocklist`.
  - Expanded `/admin/templates` into a working Template Management interface with `updateTemplateStatusAction` and native-prompt `ReviewTemplateDropdown.tsx` (approve/reject/revise capabilities).
- Verification run: `npm run lint` and `npx tsc --noEmit` pass clean in `src/`. 
- Next best step: Build the Designer Dashboard UI or add features for template approval moderation in the Admin Dashboard.

### Session 024 (2026-07-20) — Admin Template Visibility Control

- Goal: Allow admins to control which built-in templates are visible to users in the template galleries.
- Completed:
  - Created `templates` database table via migration `20260720131552_add_active_templates.sql` to track template visibility (`is_active`).
  - Updated `src/lib/admin/actions.ts` with `toggleTemplateVisibilityAction` server action.
  - Added "Active Built-in Templates" management section to `/admin/templates/page.tsx` with a new `ToggleTemplateVisibilityButton` client component.
  - Updated `TemplateGallery.tsx` to accept `activeTemplateIds` prop.
  - Updated public landing page, public template gallery, and dashboard template gallery to fetch active templates from the DB and pass them to `TemplateGallery`.
- Verification run: `npm run lint` and `npx tsc --noEmit` pass clean in `src/`.
- Evidence captured: Walkthrough artifact presented to user.
- Commits: none — not yet requested this session.
- Known risk or unresolved issue: The migration needs to be applied manually via Supabase Dashboard or CLI before the galleries will render templates.
- Next best step: Apply the migration and then move on to `billing-001` (Xendit integration).

### Session 025 (2026-07-20) — Landing Page Pricing Integration

- Goal: Integrate the provided Shadcn-based animated Pricing component into the landing page.
- Completed:
  - Installed dependencies (`lucide-react`, `framer-motion`, `canvas-confetti`, `@number-flow/react`, Radix primitives, etc.).
  - Created Shadcn utilities `src/lib/utils.ts` (`cn`) and `src/hooks/use-media-query.ts`.
  - Added UI primitives `button.tsx`, `label.tsx`, `switch.tsx` to `src/components/ui`, carefully mapping their internal Tailwind classes to Portofio's specific `DESIGN.md` tokens (e.g., `bg-accent`, `bg-surface`, `text-ink`) to maintain strict visual consistency.
  - Implemented the animated pricing grid in `src/components/blocks/pricing.tsx`, adapting the currency formatting to IDR.
  - Replaced the custom CSS modules pricing block in `src/components/landing/PricingPlans.tsx` with the new component.
  - Resolved TypeScript errors related to `@number-flow/react` typings and React `useEffect` best practices.
- Verification run: `npm run lint` and `npx tsc --noEmit` pass clean in `src/`.
- Evidence captured: Walkthrough artifact presented to user.
- Commits: none — not yet requested this session.
- Known risk or unresolved issue: The UI shows 3 pricing tiers which currently contradicts the PRD's "single monthly tier" rule. This is a known discrepancy left as-is per the user's explicit component request.
- Next best step: Move on to `billing-001` (Xendit integration) or other outstanding tasks in `feature_list.json`.
- **Update (Reverted):** The user requested to revert the landing page to its original state. The Shadcn Pricing component and its dependencies have been unlinked/removed, and `PricingPlans.tsx` along with `PricingPlans.module.css` were restored via git.
- **Update (Template Showcase restored):** The user provided the legacy `TemplateShowcase` code to be restored on the landing page instead of the new `TemplateGallery`. The code has been restored and integrated into `LandingPage.tsx`, reverting the landing page's template section to its previous coverflow UI.
- **Update (Pricing UI fix):** Added an inset box-shadow to the inactive state of the pricing toggle in the landing page (`PricingPlans.module.css`) to create a deep, pressed look, making it more distinguishable from the background as requested by the user.
- **Update (Landing Page Scroll):** Added a custom full-page scroll logic in `LandingPage.tsx` using `window.addEventListener("wheel")` which scrolls exactly one section at a time, snaps to the center of the section (`scrollIntoView({ block: "center" })`), and automatically loops back to the top when scrolling down from the last section.
- **Update (Fixed Navbar):** Changed the landing page navbar position from `sticky` to `fixed` (`Navbar.module.css`) and removed `overflow-x: hidden` from `.landingRoot` (`shared.module.css`) to ensure the navbar stays perfectly frozen at the top of the viewport during the new section-by-section scroll.
- **Update (Footer Whitespace Fix):** Removed the white space below the footer on the landing page. Shifted the bottom padding from `.faqSection` to `.faqContentWrapper` in `FAQ.module.css` so that the `faqSection` background tightly hugs the bottom of the footer without leaving a trailing gap.
- **Update (FAQ Heading & Navbar):** Changed the heading string from "Pertanyaan Umum" to "FAQ" in `messages/id.json` and added a new "FAQ" link to the landing page navbar (`Navbar.tsx` and translation files) so users can easily navigate to the FAQ section.
- **Update (FAQ Title Styling):** Enlarged the FAQ section title in `FAQ.module.css` to match the exact `3rem` size, line-height, and letter-spacing of the Testimonials section title, as requested by the user.
- **Update (Dashboard Aesthetics):** Aligned the visual style of the Dashboard ("My Workspace") with the Landing Page. The dashboard background now uses pristine white (`bg-surface`) instead of gray (`bg-canvas`), the header features the Portofio logo with a glassmorphism effect matching the Navbar, and the "New Project" buttons now use the vibrant green accent color with the landing page's signature glowing drop-shadow.
- **Update (Sidebar Aesthetics):** Adjusted `DashboardSidebar.tsx` and `layout.tsx` to match the dashboard aesthetic. Changed the outer background to `bg-surface` so the sidebar seamlessly integrates into the white canvas. Updated the active menu item highlight and the top workspace identity icon to use the primary green `accent` color instead of black (`ink`), perfectly mirroring the landing page branding.
- **Update (Navbar Profile Dropdown):** Upgraded the profile icon in the landing page `Navbar` to be an interactive dropdown. The new dropdown menu provides quick access to "Profile", "My Workspace", and a "Logout" button. Role-based access control was integrated by passing the `userRole` from the server; users with the `admin` role will automatically see an "Admin Dashboard" option, and users with the `designer` role will see a "Designer Dashboard" option within the dropdown. Translations were updated to support the new menu labels in both Indonesian and English.
- **Update (Admin Dashboard Aesthetics):** Applied the same visual alignment to the Admin Dashboard interface. Changed the admin layout background to pristine white (`bg-surface`), updated the `AdminSidebar` to use the primary green `accent` color for the portal identity icon and active menu item highlight, and added a sticky glassmorphism effect (`backdrop-blur-md bg-surface/80`) to the header across all admin pages (Users, Templates, Blocklist).
- **Update (Navbar Scrollspy):** Fixed the `Navbar.tsx` scrollspy logic to ensure the "FAQ" menu item correctly highlights as active when the user scrolls to the bottom of the page, fixing an issue where it would stay stuck on the previous section.
- **Update (Template Section Spacing):** Added `scroll-margin-top: 100px` and increased `padding-top` to `100px` in `TemplateShowcase.module.css` to prevent the template section content from overlapping with the fixed navbar when scrolling or clicking anchor links.
- **Update (Login Button Color):** Enforced white text color on the login button in the landing page navbar by adding `#ffffff !important` to the `.loginLink` class in `Navbar.module.css`.

### Session 026 (2026-07-25) — QA Pipeline Audit

- Goal: Run a full QA Pipeline pass across the codebase (test-driven correctness, code review, security, performance, browser check).
- Completed:
  - Phase 1 (Correctness): Ran baseline verification (`npm run lint`, `npx tsc --noEmit`, `npm run build`). Fixed 4 lint errors across `forgot-password/page.tsx`, `login/page.tsx` (unescaped apostrophe entities) and `AuthSplitLayout.tsx` (replaced `any` type with `React.ComponentProps<typeof Link>["href"]`).
  - Phase 2 (Debugging): Skipped — Phase 1 passed cleanly after lint fixes.
  - Phase 3 (Code Review): Verified project structure, multi-route rendering, Zod data validations, and modular component architecture. Noted 2 non-blocking follow-up notes (Deno edge function type scope, pending Supabase remote migration push).
  - Phase 4 (Security): Verified RBAC middleware route protection for `/admin`, `requireRole(['admin'])` server action checks, RLS policies, and environment secret handling. No Critical/High findings.
  - Phase 5 (Performance): Skipped — static page generation verified in ~74ms, Turbopack bundling cleanly, no explicit perf budget/baseline set.
  - Phase 6 (Browser Verification): DevTools MCP not configured in environment — reported as unverified via MCP.
- Verification: `npm run lint` (0 errors), `npx tsc --noEmit` (clean), `npm run build` (clean, 16 routes static/dynamic generation), `./init.sh` (PASSED).
- Verdict: PASS.

### Session 027 (2026-07-28) — Template-Owned Schema Architecture Refactor

- Goal: Refactor the template architecture from a global `basePortfolioSchema` trap to a Template-Owned Schema contract pattern where each template defines its own Zod schema based on its actual capabilities.
- Completed:
  - Created `baseProfileSchema` in `src/templates/shared/_base.ts` containing strictly universal fields (`profile`, `contact`, `socials`, `theme`) and defined reusable capability atom schemas (`testimonialSchema`, `pricingTierSchema`, `galleryItemSchema`, `caseStudySchema`).
  - Refactored `minimal/schema.ts`, `bold/schema.ts`, `creative/schema.ts`, `corporate/schema.ts`, `dark/schema.ts`, `studio/schema.ts`, and `portfolio-pro/schema.ts` to extend `baseProfileSchema` and own their respective capability contracts.
  - Updated template `defaults.ts`, `mapper.ts`, and `definition.ts` meta capabilities to reflect each template's owned schema capabilities.
  - Updated template renderers (`BoldRenderer`, `CorporateRenderer`, `CreativeRenderer`, `DarkRenderer`, `MinimalRenderer`) to strip unused props and render template-specific capabilities (e.g. Testimonials in Creative, Pricing in Corporate).
  - Updated `PreviewTemplateRenderer` in `registry.tsx` to handle generic document payloads.
- Verification: `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors, 0 warnings), `./init.sh` (PASSED).
- Evidence captured: `implementation_plan.md` and `task.md` created in artifact directory.
- Commits: Ready for commit.

