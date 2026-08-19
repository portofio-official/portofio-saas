# Portofio Readiness Audit

**Tanggal:** 2026-08-17  
**Ruang lingkup:** kesiapan non-billing; billing tier/Midtrans tidak dinilai ulang  
**Verdict:** **Belum siap production/public launch**

## Verification

- `./init.sh` passed: dependency install and lint clean.
- `npx tsc --noEmit` passed.
- `npm run build` passed; 35 dynamic/static routes compiled.
- Full Playwright passed on rerun: **31 passed / 3 skipped / 0 failed**.
- Targeted auth/public-site/content-library/designer/admin run passed: **14 passed / 2 skipped**. The two skipped cases require opt-in real Supabase integration.
- `git diff --check` passed.
- `messages/id.json`, `messages/en.json`, and `feature_list.json` parse successfully.
- `npm audit --audit-level=high` reports 3 high transitive vulnerabilities: `brace-expansion`, `js-yaml`, and `nanoid`.

The first full E2E run had one preview-isolation failure, but the isolated test and the complete suite passed on rerun. Treat the preview-isolation test as timing-sensitive regression coverage, not as evidence of a clean first run.

## Launch Blockers

### P0 - Authentication email delivery is not production-proven

The app sends signup and reset redirects to `/auth/confirm`, while the route only consumes `token_hash` query parameters (`src/lib/auth/actions.ts:68-74,154-157`, `src/app/auth/confirm/route.ts:7-21`). Supabase's default hosted email template returns the session in a URL fragment, which the server route cannot read. Production therefore requires real SMTP plus customized Supabase Confirm signup and Reset password templates using `{{ .TokenHash }}` and a verified Site URL. This is an external configuration blocker, not a TypeScript/build failure.

### P0 - No operational recovery or error monitoring evidence

There is no Sentry/error-tracking integration, health endpoint, webhook/cron alerting, or recorded restore drill in the repository. The PRD explicitly requires monitoring, error tracking, and scheduled backups before go-live (`docs/PRD.md:474-491`). A local schema backup file exists, but that is not proof of scheduled remote backup or a tested restore path.

### P1 - Public rendering and analytics use the service-role client

The public site reads published data through `createAdminClient()` (`src/app/sites/[subdomain]/page.tsx:3,12-18`), and the public analytics beacon does the same (`src/app/api/track/route.ts:2,66-72`). This is server-only and does not expose the key to the browser, but it bypasses RLS on public request paths and unnecessarily increases blast radius. Public reads should use an anon/server client with an explicit published-only policy; service-role access should be limited to trusted admin, cron, and webhook work.

### P1 - Public analytics ingestion has no abuse budget

`POST /api/track` accepts visitor-controlled events and inserts into `page_visits` or `section_visits` without rate limiting, retention, or a per-project budget (`src/app/api/track/route.ts:26-104`). Insert errors are ignored and the endpoint always returns `204`. A published site can therefore be used to create unbounded database work and cost.

### P1 - URL and image validation are not scheme- or file-safe

The shared URL schemas accept arbitrary URL schemes (`src/templates/shared/_base.ts:28-43`); a direct Zod check confirms `javascript:`, `data:`, and `vbscript:` values pass `z.string().url()`. `sanitizeString()` only strips a narrow `javascript:` pattern (`src/lib/utils/sanitize.ts:5-13`). Image upload accepts a base64 MIME prefix and byte count but does not verify magic bytes or dimensions (`src/lib/content/actions.ts:43-65`). Public template attributes and stored content need per-field scheme allowlists, image signature/dimension checks, and bounded decode work before launch.

### P1 - Remote database has unresolved security-advisor findings

The connected Supabase project reports mutable `search_path` warnings for database functions, publicly executable `SECURITY DEFINER` trigger/RPC functions, and disabled leaked-password protection. Some trigger-function warnings may be advisor false positives, but they must be reviewed and grants explicitly restricted before launch. The project also reports an RLS-enabled `rate_limits` table with no policies; that is intentional only if service-role-only access is documented and verified.

Security advisor remediation references:

- [Mutable function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Public SECURITY DEFINER execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

### P1 - Migration reproducibility is not proven

The remote Supabase migration registry currently exposes only the later hardening/tier migrations, while the repository contains the full historical migration chain and prior schema work was applied manually. The live tables exist, but a fresh environment cannot yet be treated as reproducible until the complete chain is applied or a documented baseline/restore procedure is verified.

## Product Gaps

### P1 - Existing project template switching is absent

The PRD says users can change template from the dashboard (`docs/PRD.md:256-260`), but the current gallery's logged-in "use template" path starts project creation (`src/components/dashboard/TemplateGallery.tsx:169-174`). No existing-project switch or non-destructive preview flow was found. This is a core product promise and should be resolved or explicitly removed from the launch promise.

### P2 - Marketing footer contains dead links

Social links and Product/Resources/Company links still use `href="#"` (`src/components/landing/Footer.tsx:25-53`). They create false affordances and should either point to real destinations or be removed before public launch.

### P2 - Cache freshness is bounded but not immediate

Public sites use `revalidate = 60` (`src/app/sites/[subdomain]/page.tsx:9-10`) and publish/unpublish actions do not visibly invalidate the public route cache. A user can wait up to roughly one minute before a publish change appears. This is acceptable for an early cohort but should be made explicit or fixed with targeted revalidation.

## What Is Ready

- Core Next.js app compiles and builds successfully.
- Auth route protection and unauthenticated redirects have browser coverage.
- Workspace/project ownership, draft autosave storage, template rendering, editor preview, Content Library, analytics UI, Admin controls, and Designer workflow have working local/integration coverage.
- The code-defined template registry and Zod parsing model is suitable for launch; uploaded Designer source is not executed directly.
- The current non-billing test suite is green after rerun.

## Decision

Do not call this production-ready yet. The minimum non-billing release gate is: production SMTP/email-template verification, public-path client separation, URL/image hardening, analytics abuse controls, remote Supabase advisor cleanup, reproducible migration/restore evidence, and a decision on template switching. After those are closed, rerun the full E2E suite plus real-account signup confirmation, password reset, public-site publish/read, cross-tenant isolation, and restore-drill checks.

Orca worker dispatch was attempted for parallel read-only review, but both workers failed with `401 Unauthorized` from `agentrouter.org` because the agent token was expired. This did not modify the worktree; the findings above are based on direct repository, build, E2E, and Supabase advisor verification.
