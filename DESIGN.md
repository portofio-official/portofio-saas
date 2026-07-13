# DESIGN.md — Portofio App UI Design System

**Scope:** the Portofio application UI — marketing/landing pages, auth screens,
dashboard, portfolio editor, template gallery, billing screens.
**NOT in scope:** the 5 user-facing portfolio templates (Minimal, Bold,
Creative, Corporate, Dark) — those have their own per-template specs in PRD 7.3
and render under `/sites/[subdomain]`.

**Mode:** light only. The app UI does not ship a dark mode in MVP. Do not add
`dark:` variants or `prefers-color-scheme` handling to app UI code; remove them
where the scaffold left them.

Every screen built for `auth-001` → `billing-001` must follow this document.
Deviations require updating this file first.

---

## 1. Design Direction

**Archetype: Soft Structuralism.** Near-white silver canvas, massive confident
grotesk typography, airy floating surfaces with very soft, highly diffused
ambient shadows. The UI should feel like machined objects resting on paper —
calm, physical, expensive. One restrained accent color, used sparingly.

Layout language: **Editorial Split** for heroes (huge type left, interactive
content right) and **Asymmetrical Bento** for feature/dashboard grids. Never
symmetrical 3-column template grids.

---

## 2. Color Tokens

Define once as Tailwind v4 `@theme` tokens in `src/app/[locale]/globals.css`.

```css
@theme {
  --color-canvas:      #F6F6F4;  /* page background — warm silver */
  --color-surface:     #FFFFFF;  /* cards, inputs, nav pill */
  --color-shell:       #EDEDEA;  /* double-bezel outer tray */
  --color-ink:         #17171A;  /* primary text, near-black */
  --color-ink-soft:    #55555C;  /* secondary text */
  --color-ink-faint:   #8B8B92;  /* placeholders, meta */
  --color-accent:      #3532E5;  /* electric ultramarine — CTAs, focus, active */
  --color-accent-deep: #2B28C6;  /* accent hover/pressed */
  --color-accent-tint: #EDEDFC;  /* accent wash backgrounds, selected states */
  --color-positive:    #1D7A4F;  /* success (subscription active, published) */
  --color-danger:      #C2382E;  /* destructive, errors */
}
```

Rules:
- Hairlines are always alpha-black, never solid grey: `ring-1 ring-black/5`
  (resting) or `ring-black/10` (interactive hover). **Never** `border-gray-200`
  or any generic 1px solid grey border.
- Accent appears in at most ~5% of any screen: primary CTA, focus rings,
  active nav state, live "published" indicators. Everything else is ink on
  silver/white.
- Text contrast: body text is `--color-ink` or `--color-ink-soft` only —
  both pass AA on canvas and surface. Never place `ink-faint` text below 14px.

---

## 3. Typography

| Role | Font | Loading |
|---|---|---|
| Display (headings ≥ 32px, hero, section titles) | **Clash Display** (Fontshare) | `next/font/local`, self-host woff2 in `public/fonts/` |
| UI & body | **Geist** | already wired via `next/font/google` in the scaffold |
| Numeric / code / subdomain preview | **Geist Mono** | already wired |

Banned outright: Inter, Roboto, Arial, Open Sans, Helvetica.

Scale (desktop → mobile via `clamp()`):

```
hero H1        clamp(2.75rem, 7vw, 6rem)    Clash Display 600, tracking-[-0.03em], leading-[0.95]
section H2     clamp(2rem, 4vw, 3.5rem)     Clash Display 600, tracking-[-0.02em]
card title     1.25–1.5rem                  Clash Display 500
body           1rem / leading-7             Geist 400
small/meta     0.8125rem                    Geist 500, text-ink-soft
eyebrow        10px uppercase tracking-[0.2em]  Geist 500
```

Every major H1/H2 is preceded by an **eyebrow tag**: a pill badge —
`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium
bg-black/[0.04] text-ink-soft ring-1 ring-black/5 w-max`.

---

## 4. Spatial Rhythm

- Marketing sections: `py-24` minimum, `py-32`–`py-40` for hero and pricing.
  Whitespace is the texture of this design — when in doubt, double it.
- Dashboard/editor sections: `py-10`–`py-16` (denser, but never cramped —
  minimum `gap-6` between functional groups).
- Container: `max-w-6xl mx-auto px-6` (marketing), `max-w-7xl` (dashboard).
- Full-height sections use `min-h-[100dvh]`, never `h-screen`.
- **Mobile (<768px):** every asymmetric layout collapses to a single column:
  `w-full px-4 py-8`+, `grid-cols-1`, all `col-span-*` reset, all rotations
  and negative-margin overlaps removed.

---

## 5. Shape & Depth

### 5.1 Radii

- Major cards / trays: `rounded-[2rem]`
- Nested inner cores: concentric — `rounded-[calc(2rem-0.375rem)]` when the
  shell has `p-1.5` (inner radius = outer radius − padding, always)
- Buttons, badges, nav: `rounded-full`
- Inputs: `rounded-2xl`

### 5.2 The Double-Bezel (mandatory for every major card, image, form panel)

No premium surface sits flat on the canvas. Structure:

```html
<!-- Outer shell: the aluminum tray -->
<div class="rounded-[2rem] bg-shell/80 p-1.5 ring-1 ring-black/5">
  <!-- Inner core: the glass plate -->
  <div class="rounded-[calc(2rem-0.375rem)] bg-surface
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(23,23,26,0.04)]
              ring-1 ring-black/[0.04] p-6 md:p-8">
    …content…
  </div>
</div>
```

### 5.3 Shadows

Only soft, highly diffused ambient shadows — light coming from everywhere:

```
resting card   shadow-[0_24px_80px_-32px_rgba(23,23,26,0.18)]
floating nav   shadow-[0_16px_48px_-24px_rgba(23,23,26,0.22)]
hover lift     shadow-[0_32px_96px_-32px_rgba(23,23,26,0.22)]
```

Banned: `shadow-md`, `shadow-lg`, any harsh `rgba(0,0,0,0.3)` drop shadow.

---

## 6. Component Recipes

### 6.1 Floating Island Nav

Never an edge-to-edge sticky bar. The nav is a detached glass pill:

```
fixed top-0 inset-x-0 z-40 → inner: mt-6 mx-auto w-max rounded-full
bg-surface/80 backdrop-blur-xl ring-1 ring-black/5 px-2 py-2
shadow-[0_16px_48px_-24px_rgba(23,23,26,0.22)]
```

- Links: `px-4 py-2 rounded-full text-sm text-ink-soft` → active/hover gets
  `bg-black/[0.04] text-ink`.
- Locale switcher (id/en) lives here as a compact segmented pill.
- Mobile: pill shrinks to logo + hamburger. Hamburger lines **morph** into an
  X (two absolutely-positioned lines animating to `rotate-45`/`-rotate-45`),
  opening a full-screen `bg-white/85 backdrop-blur-3xl` overlay whose links
  stagger in: `translate-y-12 opacity-0 → translate-y-0 opacity-100` with
  `delay-100/150/200…` per item.

### 6.2 Primary CTA — Button-in-Button

```html
<button class="group inline-flex items-center gap-3 rounded-full
               bg-ink text-white pl-6 pr-2 py-2
               transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
               hover:bg-black active:scale-[0.98]">
  <span class="text-sm font-medium">Mulai gratis</span>
  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15
               transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
               group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
    ↗
  </span>
</button>
```

- Accent variant: `bg-accent hover:bg-accent-deep`, inner circle `bg-white/20`.
- Secondary: `bg-surface text-ink ring-1 ring-black/10 hover:ring-black/20`,
  inner circle `bg-black/5`.
- The trailing icon **never** sits naked next to the label — always inside its
  own circular wrapper, flush with the button's right inner edge (`pr-2`).

### 6.3 Inputs (portfolio form, auth)

```
rounded-2xl bg-surface ring-1 ring-black/[0.07] px-4 py-3 text-ink
placeholder:text-ink-faint
focus:outline-none focus:ring-2 focus:ring-accent/70
transition-shadow duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
```

Labels: `text-[13px] font-medium text-ink-soft mb-1.5`. Group long forms into
double-bezel panels per PRD 7.2 section (bio / experience / projects / …).

### 6.4 Bento Grids (features, dashboard overview)

12-col grid, asymmetric spans (`md:col-span-8 md:row-span-2` beside stacked
`md:col-span-4` cards), `gap-4 md:gap-5`. Every cell is a double-bezel card.
One cell per grid may use `bg-accent-tint` as its inner-core background to
create a focal point. Collapses to `grid-cols-1 gap-6` below `md`.

### 6.5 Status & badges

- Published: dot + label — `h-1.5 w-1.5 rounded-full bg-positive` +
  `text-[13px] text-ink-soft`.
- Draft: same with `bg-ink-faint`.
- Plan/paywall chips reuse the eyebrow-tag recipe with `bg-accent-tint
  text-accent ring-accent/10`.

---

## 7. Motion Choreography

**The one curve:** `cubic-bezier(0.32,0.72,0,1)` — heavy start, long glide.
Never `linear`, never `ease-in-out`, never instant state changes.

| Interaction | Duration | Recipe |
|---|---|---|
| Hover states (buttons, cards, links) | 400–500ms | transform + shadow only |
| Press | 150ms | `active:scale-[0.98]` |
| Scroll entry reveal | 800ms | `opacity-0 translate-y-16 blur-md` → `opacity-100 translate-y-0 blur-0` |
| Nav overlay open | 600ms | overlay fades/blurs in, links stagger +50ms each |
| Live preview template swap | 500ms | crossfade via opacity, no layout shift |

Rules:
- Scroll reveals via a small `IntersectionObserver` hook (`useReveal`) or CSS
  view-timeline — **never** `window.addEventListener('scroll')`.
- Stagger siblings by 50–80ms; cap total stagger at ~400ms.
- Respect `prefers-reduced-motion: reduce` — all reveals collapse to a plain
  fast fade, transforms disabled.

---

## 8. Iconography

- **Phosphor Icons, `weight="light"`** (`@phosphor-icons/react`), 1.5px-feel
  strokes, sized 16–20px inline / 24px feature.
- Banned: default Lucide stroke weight, FontAwesome, Material Icons.
- Icons are monochrome ink or ink-soft; accent only for active states.

---

## 9. Performance & Discipline Guardrails

- Animate **only** `transform` and `opacity`. Never `top/left/width/height`.
- `will-change: transform` only on elements actively animating.
- `backdrop-blur` only on fixed/sticky elements (nav pill, overlays) — never
  on scrolling content or large areas.
- Z-index ladder, no arbitrary values: `z-40` nav · `z-50` overlay/modal ·
  `z-60` toast/tooltip. Nothing else.
- Focus visibility is non-negotiable: every interactive element keeps a
  visible `focus-visible:ring-2 ring-accent/70` ring.
- All copy comes from `messages/{id,en}.json` (next-intl) — no hardcoded
  strings, both locales shipped together (PRD 7.7).

---

## 10. Anti-Pattern Checklist (review before merging any UI)

- [ ] No Inter/Roboto/Arial/Open Sans/Helvetica anywhere
- [ ] No generic 1px solid grey borders — alpha hairlines only
- [ ] No `shadow-md`/harsh shadows — diffused ambient recipe only
- [ ] No edge-to-edge sticky navbar — floating island pill only
- [ ] No symmetric 3-col template grid — asymmetric bento or editorial split
- [ ] No `linear`/`ease-in-out`/instant transitions — the one curve, always
- [ ] Every major surface is double-bezel (shell + concentric core)
- [ ] CTAs use button-in-button trailing icon
- [ ] Sections breathe (`py-24`+ marketing) and collapse cleanly below 768px
- [ ] Entry animations present; transform/opacity only; reduced-motion honored
- [ ] `dark:` variants absent from app UI code
- [ ] Overall read: crafted hardware, not template
