# Portofio

SaaS portfolio-website builder: fill a structured form, pick a template, preview live, publish to a subdomain. No drag-and-drop canvas — form + template, built for non-technical users (fresh graduates, freelancers, job seekers, content creators) who want a professional portfolio site without learning design or code.

Building and previewing a portfolio is **free**. Publishing requires a paid Basic, Premium, or Enterprise plan through Midtrans. All plans temporarily allow one live website per account; Premium adds custom domains and removes the Basic watermark.

**Live demo:** https://portofio-beta.vercel.app/

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend | [Supabase](https://supabase.com) (Postgres, Auth, Storage, RLS) |
| Billing | [Midtrans](https://midtrans.com) |
| Animation | GSAP, Framer Motion |
| i18n | next-intl (English + Bahasa Indonesia) |
| Hosting | Vercel (wildcard subdomains) |

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key — server-side only, bypasses RLS |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key (use sandbox keys in development) |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key (needed only for embedded Snap.js checkout) |
| `MIDTRANS_MERCHANT_ID` | Midtrans Merchant ID (reference/configuration metadata) |
| `MIDTRANS_IS_PRODUCTION` | Set `true` only for the Midtrans production environment |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Root domain the app is served on (`localhost:3000` locally). Lets middleware tell the app apart from a published site's subdomain. |

### Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```

`./init.sh` runs install + lint as a baseline sanity check (used at the start of each dev session per `CLAUDE.md`).

---

## Features

- **Workspaces** — one account can hold multiple workspaces (brand profiles), each with its own data, template choice, and subdomain.
- **7 templates** — Minimal, Bold, Creative, Corporate, Dark, Vanguard Studio ("studio"), Portfolio Pro. The first five share one base data contract (`basePortfolioSchema`); the two newest extend it with their own sections.
- **Live preview** — real-time as the form is filled; the public template gallery previews with demo data before signup.
- **Subdomain publishing** — one-click deploy via a `publish_project()` RPC, gated behind an active subscription.
- **Bilingual UI** — English and Bahasa Indonesia throughout the app.

---

## Project Structure

```
src/
  app/
    [locale]/         # localized app routes (dashboard, login, signup, templates, ...)
    sites/[subdomain]/ # published-site rendering by subdomain
    auth/              # auth callback routes
    api/               # route handlers (webhooks, cron, tracking)
  components/
    landing/           # marketing/landing page
    dashboard/         # dashboard + workspace management UI
    portfolio/         # portfolio rendering (shared sections)
    admin/  designer/  onboarding/  profile/  content/  workspace/  auth/  ui/
  templates/
    definitions/       # one folder per template (minimal, bold, creative, corporate, dark, studio, portfolio-pro)
    registry.tsx       # TEMPLATE_REGISTRY
  lib/
    supabase/          # Supabase client/server helpers
    workspace/  projects/  billing/  content/  auth/  analytics/  designer/  admin/  utils/
  i18n/                # next-intl config
messages/              # en.json / id.json translation files
supabase/              # DB migrations + edge functions
scripts/               # maintenance scripts (e.g. scripts/backfill-profiles.mjs)
e2e/                   # Playwright E2E specs (flows/ has one spec per flow)
docs/                  # PRD, DESIGN, and other product/engineering docs
```

Templates are defined in code via `TEMPLATE_REGISTRY` in `src/templates/registry.tsx` — there is no `templates` table in the database.

---

## Documentation

- [`PRD.md`](./docs/PRD.md) — full product spec: user flows, scope, and database schema (source of truth, read before any architecture decision).
- [`DESIGN.md`](./docs/DESIGN.md) — design tokens, component anatomy, UI guidelines (light mode only).
- [`claude-progress.md`](./claude-progress.md) — running development log.
- [`feature_list.json`](./feature_list.json) — feature status tracker (system of record for what's done vs. pending).
