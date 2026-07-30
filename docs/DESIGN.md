# DESIGN.md — Portofio App UI Design System

**Scope:** the Portofio *application* UI — auth screens, dashboard, portfolio
editor, template gallery, billing screens, and the marketing landing page.
**NOT in scope:** the 5 user-facing portfolio templates (Minimal, Bold,
Creative, Corporate, Dark) that a workspace's *visitor* sees — those are
deliberately varied per-template (own specs in PRD 7.3), render under
`/sites/[subdomain]`, and must not be pulled toward this brand palette.

The landing page (`src/components/landing/`) shares this palette, type, and
icon system but implements it via its own scoped CSS Modules
(`shared.module.css`), not these Tailwind theme tokens directly — same visual
language, separate implementation. Don't expect to find `bg-canvas` etc. in
landing component files.

**Mode:** light only. The app UI does not ship a dark mode in MVP. Do not add `dark:` variants or `prefers-color-scheme` handling to app UI code.

Every screen built for `auth-001` → `billing-001` must follow this document.

---

## 1. Design Direction

**Archetype: Clean, Modern SaaS.** Soft off-white backgrounds, crisp white cards, vibrant green accent for actions. The UI should feel approachable, fast, and familiar. 

Layout language: Standard grids, clean containers, distinct visual hierarchy without over-engineering.

---

## 2. Color Tokens

Defined as Tailwind v4 `@theme` tokens in `src/app/[locale]/globals.css`.

```css
@theme {
  --color-canvas:      #F0F3F9;  /* App background */
  --color-surface:     #FFFFFF;  /* Cards, modals, inputs */
  --color-ink:         #111827;  /* Primary text */
  --color-ink-soft:    #4B5563;  /* Secondary text */
  --color-ink-faint:   #9CA3AF;  /* Placeholders, meta */
  --color-accent:      #00cf7c;  /* Brand green — CTAs, active states */
  --color-accent-deep: #00b368;  /* Accent hover/pressed */
  --color-positive:    #00cf7c;  /* Success */
  --color-danger:      #EF4444;  /* Destructive, errors */
}
```

Rules:
- Borders are subtle and light: `ring-1 ring-black/5` or `ring-black/10`.
- Use the vibrant green accent (`--color-accent`) for primary actions and active states. 

---

## 3. Typography

| Role | Font | Loading |
|---|---|---|
| Display / Headings | **Outfit** | `next/font/google` |
| UI & Body | **Inter** | `next/font/google` |
| Numeric / Code | **Geist Mono** | `next/font/google` |

Scale (desktop → mobile via Tailwind classes):
- Use `font-bold` for headings.
- Use `tracking-tight` for large display text.

---

## 4. Shape & Depth

### 4.1 Radii

- Major cards / trays: `rounded-2xl`
- Standard cards / panels: `rounded-xl`
- Buttons, inputs: `rounded-full` or `rounded-lg` depending on context (pills vs standard).

### 4.2 Surfaces

Default to flat, single-layer surfaces: standard shadow and a hairline ring.

```html
<div class="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
  …content…
</div>
```

**Double-bezel (nested outer shell + inner core) is reserved, not banned.**
Use it only for a page's primary content cards where the extra depth earns
its keep (workspace grid cards, template gallery cards) — outer shell
`rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5` wrapping an inner
`rounded-[1.6rem] bg-white shadow-sm ring-1 ring-black/5` core. Everywhere
else (panels, sidebar, inputs, modals) stays flat per the rule above. Don't
mix the two treatments within the same card grid.

### 4.3 Shadows

Use the unified soft shadows:
- `shadow-sm` (Default card resting)
- `shadow-md` (Hover state or elevated card)
- `shadow-floating` (Navbars, modals)

---

## 5. Component Recipes

### 5.1 Navbar
The navbar should be a standard sticky bar with a translucent blur, not a floating pill.
```html
<nav class="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-black/5">
  ...
</nav>
```

### 5.2 Primary CTA
Simple, solid rounded-full buttons.
```html
<button class="rounded-full bg-accent px-6 py-2 text-white font-medium hover:bg-accent-deep transition-colors">
  Mulai gratis
</button>
```

### 5.3 Inputs
Clean inputs with subtle borders.
```html
<input class="rounded-lg bg-surface ring-1 ring-black/10 px-4 py-2 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent" />
```

---

## 6. Motion Choreography

**The curve:** `cubic-bezier(0.4, 0, 0.2, 1)` (standard ease-out).

| Interaction | Duration | Recipe |
|---|---|---|
| Hover states | 200ms | Standard Tailwind `duration-200` |
| Scroll entry reveal | 800ms | Opacity fade and translate |

---

## 7. Iconography

- **Material Symbols Outlined**.
- Loaded globally via `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />`.
- Banned: Phosphor Icons.

---

## 8. Anti-Pattern Checklist (review before merging any UI)

- [ ] No Clash Display or Geist Sans anywhere. Use Outfit and Inter.
- [ ] Double-bezel only on primary content cards (workspace grid, template gallery) — flat surfaces everywhere else, never mixed within one grid.
- [ ] No Phosphor Icons in app-shell/editor UI. Use Material Symbols Outlined. (The 5 user-facing portfolio templates are exempt — out of scope, see top.)
- [ ] Primary CTAs should use the green accent color (`#00cf7c`).
- [ ] Ensure consistent use of `bg-canvas` for backgrounds and `bg-surface` for cards.
- [ ] No decorative control that doesn't do anything (fake dropdown chevrons, unwired search/sort) — wire it for real or delete it.
