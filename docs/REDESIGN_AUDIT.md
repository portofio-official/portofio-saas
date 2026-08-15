# Redesign Audit & Fix List

**Date:** 2026-08-15
**Scope:** App UI + marketing landing, per `docs/DESIGN.md` (light mode only).
**Method:** Design audit of `src/components/landing/`, `src/components/auth/`,
`src/components/onboarding/`, `src/components/dashboard/`, root layout, and i18n
copy in `messages/{en,id}.json`.

## Executive summary

The landing page (`src/components/landing/*`), dashboard (Framer-style, sessions
068–077), and reset-password screen (`AuthCard`) are already redesigned and
follow the design system. The clear weak surfaces are:

1. **Auth screens (login / signup / forgot-password)** still run on the dated
   `AuthSplitLayout` — a dark split-panel with a stock Unsplash photo, inline
   styles, hardcoded hexes, and `100vh`. This is the single highest-visual-impact
   fix remaining.
2. **Onboarding page** uses hardcoded hex colors instead of DESIGN.md tokens.
3. **Landing footer** is a dead-link farm (`href="#"` ×9) with generic social
   icons and no real destinations.
4. **Content drift**: the landing pricing tiers still claim "5 Portfolio
   Websites" / "Unlimited Websites" and reference "Free"/"Pro", which contradict
   PRD v1.9 (one live website per account on every tier; Basic/Premium/Enterprise).
5. **Missing platform basics**: no custom 404 page, no skip-to-content link,
   no `window.alert()` removal, no og:image/twitter meta on marketing pages.

## Diagnosis by category

### Typography
| Finding | File | Fix |
|---|---|---|
| Fonts already match DESIGN.md (Outfit / Inter / Geist Mono). | layout.tsx | none |
| Auth/onboarding hardcode font+color via inline `style` + hex. | AuthSplitLayout.tsx, login/signup/forgot pages, OnboardingClientView | move to design tokens |
| `100vh` layout that jumps on iOS Safari. | AuthSplitLayout.module.css:4, Hero.module.css:15 (`calc(100vh - 160px)`) | `min-height: 100dvh` (Hero too) |

### Color and surfaces
| Finding | File | Fix |
|---|---|---|
| **Random dark panel** (`#111827`) + stock Unsplash workspace photo in a light-only app — the exact "dark section in a light page" anti-pattern. | AuthSplitLayout.module.css:24, AuthSplitLayout.tsx:36 | replace split layout with light `AuthCard` pattern (already exists) |
| **Second accent color** — orange stars `#FCA311`. | Testimonials.tsx:21 | use accent green or neutral |
| Hardcoded hexes bypassing tokens. | AuthSplitLayout.module.css (`#f9fafb`, `#e5e7eb`, `#9ca3af`, `rgba(0,207,124,0.39)`), OnboardingClientView.tsx (`#F0F3F9`, `#111827`, `#4B5563`, `#D1D5DB`) | use `bg-canvas`, `bg-surface`, `ring-black/*`, `text-ink*` |
| Landing + dashboard surfaces already tokenized. | landing/*.module.css, dashboard/*.tsx | none |

### Layout
| Finding | File | Fix |
|---|---|---|
| Auth split layout: 60/40 hard split, `100vh`, no container discipline. | AuthSplitLayout.module.css | replace with centered `AuthCard` (consistent with reset-password) |
| Onboarding `min-h-screen` + hardcoded hexes. | OnboardingClientView.tsx:54 | `min-h-dvh` + tokens |

### Interactivity & states
| Finding | File | Fix |
|---|---|---|
| Auth buttons lift with `translateY(-2px)` on hover (layout shift) and no pressed feedback. | AuthSplitLayout.module.css:489,546 | use `active:scale-[0.98]` + color-only hover (matches DESIGN.md recipes) |
| Auth input focus lacks the standard focus ring. | AuthSplitLayout.module.css:411 | `focus:ring-2 focus:ring-accent` (FormField already does this) |
| `window.alert()` used for errors. | FAQ.tsx:28 (landing), admin/ReviewTemplateDropdown.tsx:44,53,64 | inline/section message, never `alert()` |
| No skip-to-content link anywhere. | root layout + all pages | add hidden skip link targeting `#main` |

### Content
| Finding | File | Fix |
|---|---|---|
| **Pricing copy contradicts PRD v1.9**: "1 Portfolio Website", "5 Portfolio Websites", "Unlimited Websites"; "Everything in Free/Pro, plus". | messages/en.json + id.json (Landing.PricingPlans.tiers) | mirror real entitlement: 1 live website per account all tiers; Basic=watermark+subdomain, Premium=no watermark+custom domain; drop Free/Pro references |
| Prices are placeholder copy (49k/79k/149k) not DB-backed. | PricingPlans.tsx:18-22 | keep as marketing placeholders but align tiers with `plans` catalog (billing-002) |
| No recommended-tier emphasis — three equal towers. | PricingPlans.module.css | highlight the tier that matches current business focus |
| `pravatar.cc` avatars (generic stock-look). | Testimonials.tsx:8-13 | keep but note; prefer unique generated initials avatars or real assets |
| Landing copy otherwise real (names, roles, FAQ). | messages/*.json | none |

### Component patterns
| Finding | File | Fix |
|---|---|---|
| Footer link farm: 9 × `href="#"` dead links + generic social icons. | Footer.tsx:26-52 | link template→`#templates`/`/templates`, pricing→`#pricing`; drop or real-link guide/help/about/contact; disable visibly if no destination |
| FAQ "View all" button fires `alert`. | FAQ.tsx:28 | remove button or navigate to `/templates`-adjacent content |
| No custom 404. | — | add `not-found.tsx` per locale with brand + home CTA |
| Accordion avoided (static cards) — good. | FAQ.tsx | none |
| Dashboard modals/empty/error states already built. | DashboardClientView.tsx | none |

### Iconography
| Finding | File | Fix |
|---|---|---|
| Landing uses `@phosphor-icons/react` (Hero, PricingPlans, Testimonials, Footer) while app-shell uses Material Symbols. DESIGN.md §7/§8 bans Phosphor in app-shell/editor UI; landing is a separate scoped implementation, so not a hard violation — but the mix is a visual inconsistency. | landing/*.tsx | unify: use Material Symbols on landing too, or document Phosphor as landing-only |
| `img` tags instead of `next/image` for landing logos/photos. | Navbar.tsx:39, Footer.tsx:19, AuthSplitLayout.tsx:36, Testimonials.tsx:31 | use `next/image` where beneficial |

### Code quality & strategy
| Finding | File | Fix |
|---|---|---|
| Inline styles mixed with classes. | AuthSplitLayout.tsx, login/signup/forgot pages | remove; move to CSS modules/tokens |
| Marketing pages lack og:image/twitter metadata (only `/sites/[subdomain]` has it). | `[locale]/page.tsx`, layout.tsx:25 | add default `metadata.openGraph`/`twitter` with an og image |
| No skip link, no custom 404 (repeat of above). | — | platform basics |
| No cookie consent banner (jurisdiction-dependent). | — | optional; note only |
| Dead `href="#"` everywhere. | Footer.tsx | see components |

## Priority fix list (impact / risk)

1. **Auth screens → `AuthCard`** (login, signup, forgot-password + success states).
   Migrate off `AuthSplitLayout` onto the existing light `AuthCard`/`FormField`
   pattern. Removes the dark panel, stock photo, `100vh`, inline styles, and
   hardcoded hexes in one move. Keep every server action + the signup password
   checklist. Delete `AuthSplitLayout.*` + `AuthInput`/`AuthSubmitButton`
   afterwards. Lowest risk: pattern already ships on reset-password.
2. **Onboarding tokens** — swap hardcoded hexes for DESIGN.md classes; `min-h-dvh`.
3. **Footer dead links** — real destinations or visibly-disabled items; unify icons.
4. **Pricing copy + recommended tier** — align tiers with PRD v1.9; emphasize one tier.
5. **Platform basics** — locale `not-found.tsx`, skip-to-content link, marketing
   `og:image`/twitter meta, replace `alert()` calls.
6. **Micro-polish** — `100dvh` on Hero, tabular numbers where data appears, pressed
   states, focus rings on any remaining bespoke inputs.

## Not doing (out of scope)

- Template redesigns under `/sites/[subdomain]` (explicitly out of DESIGN.md scope).
- Dark mode, drag-and-drop, or framework migrations.
- Content content like pricing DB-drive (tracked in `billing-002`).
