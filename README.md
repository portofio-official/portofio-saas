# Portofio

SaaS portfolio-website builder: fill a structured form, pick a template, preview live, publish to a subdomain. No drag-and-drop canvas — form + template, built for non-technical users (fresh graduates, freelancers, job seekers, content creators) who want a professional portfolio site without learning design or code.

Building and previewing a portfolio is **free**. Publishing it to a live subdomain (`namamu.appku.com`) requires a paid monthly subscription (single plan, no freemium tiers).

**Live demo:** https://portofio-beta.vercel.app/

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend | [Supabase](https://supabase.com) (Postgres, Auth, Storage, RLS) |
| Billing | [Xendit](https://xendit.co) |
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
| `XENDIT_SECRET_KEY` | Xendit API key (use sandbox keys in development) |
| `XENDIT_WEBHOOK_TOKEN` | Verifies incoming Xendit webhook callbacks |
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
  components/
    landing/           # marketing/landing page
    dashboard/         # dashboard + workspace management UI
    portfolio/         # portfolio rendering (shared sections)
    templates/         # one folder per template (bold, corporate, creative, dark, minimal, portfolio-pro, studio)
    workspace/  auth/  ui/
  lib/
    supabase/          # Supabase client/server helpers
    templates/          # TEMPLATE_REGISTRY + per-template Zod schemas
    workspace/  projects/  billing/  auth/  utils/
  i18n/                # next-intl config
messages/              # en.json / id.json translation files
supabase/               # DB migrations
```

Templates are defined in code via `TEMPLATE_REGISTRY` and per-template Zod schemas under `src/lib/templates/schemas/` — there is no `templates` table in the database.

---

## Documentation

- [`PRD.md`](./PRD.md) — full product spec: user flows, scope, and database schema (source of truth, read before any architecture decision).
- [`DESIGN.md`](./DESIGN.md) — design tokens, component anatomy, UI guidelines (light mode only).
- [`claude-progress.md`](./claude-progress.md) — running development log.
- [`feature_list.json`](./feature_list.json) — feature status tracker (system of record for what's done vs. pending).
