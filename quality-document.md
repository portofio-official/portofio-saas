# Quality Document

A quality snapshot for each product domain and architectural layer. Both agents and humans can use this document to quickly understand where the codebase is strong and where it needs work.

**Update cadence:** After each significant session, or before starting a new phase of work.

**Grading scale:**

- **A**: All verification passing, clean architecture, agent-legible, stable tests
- **B**: Verification passing, mostly clean, minor gaps in legibility or test coverage
- **C**: Partially working, known gaps, some code areas hard for agents to understand
- **D**: Not working, or major structural issues
- **N/A**: Not yet implemented (pre-code stage)

---

## Product Domains

| Domain | Grade | Verification | Agent Legibility | Test Stability | Key Gaps | Last Updated |
|--------|-------|-------------|-----------------|---------------|----------|-------------|
| Setup (Next.js + Supabase scaffold) | B | lint/tsc/build pass; Supabase read/write not run (no real project) | high — standard Next.js App Router layout | n/a (no test suite yet) | `setup-001` in_progress: real Supabase project not provisioned, repo not yet under git | 2026-07-13 |
| Auth | N/A | not run | n/a | n/a | `auth-001` blocked on setup-001 reaching `passing` (needs real Supabase project for auth) | 2026-07-13 |
| Portfolio Data Form | N/A | not run | n/a | n/a | `data-001` blocked on setup-001 | 2026-07-12 |
| Template & Preview | N/A | not run | n/a | n/a | `template-001` blocked on data-001 (needs data shape) | 2026-07-12 |
| Publish / Subdomain Routing | C | subdomain rewrite verified locally via curl; not run against real DNS/production | high — proxy.ts is short and commented | n/a | `publish-001` blocked on template-001 + data-001; wildcard DNS not configured; production domain still a placeholder | 2026-07-13 |
| Dashboard | N/A | not run | n/a | n/a | `dashboard-001` blocked on publish-001 | 2026-07-12 |
| Billing | N/A | not run | n/a | n/a | `billing-001` blocked on dashboard-001; Xendit sandbox not set up. Model is publish-gate (single paid plan), not freemium — see PRD 7.6/10 | 2026-07-13 |

## Architectural Layers

| Layer | Grade | Boundary Enforcement | Agent Legibility | Key Gaps | Last Updated |
|-------|-------|---------------------|-----------------|----------|-------------|
| Frontend (Next.js dashboard + public render) | B | i18n boundary clean (`[locale]` segment vs `/sites/[subdomain]` outside it) | high | Only a placeholder home page and placeholder public-site page exist; no real dashboard/form UI yet | 2026-07-13 |
| Proxy / Subdomain Routing | B | `src/proxy.ts` handles both subdomain rewrite and locale detection; verified via curl | high — single small file, PRD-referenced comments | Not tested against real wildcard DNS/production; forbidden-word/rate-limiting logic not implemented (PRD 9.5) | 2026-07-13 |
| API / Server Actions | N/A | n/a | n/a | No backend logic written yet | 2026-07-12 |
| Database / Auth (Supabase) | C | client/server Supabase wrappers wired and smoke-tested against placeholder credentials only | high | No real project provisioned, no schema/tables/RLS policies written yet (PRD 9.4, 9.5) | 2026-07-13 |
| Billing Integration (Xendit) | N/A | n/a | n/a | No provider abstraction built yet (PRD 9.2 notes an interface for provider swap) | 2026-07-12 |

## Change History

### 2026-07-13 (session 003 — scaffold)

- Changes: Executed `setup-001`. Scaffolded Next.js 16 (App Router, TS, Tailwind v4) merged into the existing docs-only repo; added next-intl (id/en) with `[locale]` routing; added Supabase browser/server clients; added `src/proxy.ts` (Next.js 16's renamed middleware convention) doing combined subdomain rewrite + locale detection; added `.env.example`/`.env.local` (placeholder Supabase creds — no real project yet); added placeholder `/sites/[subdomain]` public-site route.
- Domains promoted: Setup N/A → B; Publish/Subdomain Routing N/A → C (routing works locally, nothing else built yet)
- Demoted: none
- New gaps identified: repo still has no git history (git init proposed, not yet approved by user)
- Gaps closed: Next.js/Supabase/i18n scaffold no longer missing; local subdomain dev flow proven end-to-end

### 2026-07-13 (session 002 — docs)

- Changes: Document-improvement pass — PRD bumped to v1.1: monetization changed from freemium to publish-gate (free build/preview, single paid plan to publish), auth narrowed to email/password, bilingual UI (id/en) added, PortfolioData contract and 5 template specs added, dev-environment section added. Harness docs synced (stale PRD filename references fixed, feature_list.json rewritten for the new billing model).
- Domains promoted: none (still pre-code)
- Demoted: none
- New gaps identified: none — open questions tracked in PRD section 16
- Gaps closed: ambiguous monetization/auth/i18n decisions; missing data contract for templates

### 2026-07-12

- Changes: Initial harness setup from PRD.md (then referenced by an older filename); no application code written yet.
- Domains promoted: none
- Demoted: none
- New gaps identified: entire project unbuilt — see `feature_list.json` for the dependency order (setup → auth → data → template → publish → dashboard → billing)
- Gaps closed: none
