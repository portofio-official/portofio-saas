# Anti-Slop UI Audit 002: Designer Portal

**Mode:** AFTER
**Scope:** `/[locale]/designer`, `/[locale]/designer/submissions`, `/[locale]/designer/submissions/new`, `/[locale]/designer/submissions/[id]`, and the shared Designer shell in the current worktree.
**Direction:** `docs/DESIGN.md` governs the app UI: light-only, green accent, flat dashboard shell, Material Symbols, restrained shadows, and responsive layouts.
**Design Read:** Designer Portal for template contributors, with a clean SaaS visual language, `ENERGY 2 / RHYTHM 2 / MOTION 1`. The screen's primary job is to create, save, submit, and monitor template submissions, so submission state is the visual priority.

## Findings

### 1. HIGH — Missing route loading and error states

**Rules:** R-27, C-4

The Designer route tree has no `loading.tsx` or `error.tsx`. `DesignerPage` and `DesignerSubmissionsPage` await server data directly, so slow reads have no route-level loading UI and a failed `listTemplateSubmissions()` read falls through to the generic application failure path. The form has inline save/submit errors, but the list and overview screens do not have an error recovery state.

**Evidence:**
- `src/app/[locale]/designer/page.tsx:4-6`
- `src/app/[locale]/designer/submissions/page.tsx:5-6`
- No files under `src/app/[locale]/designer/loading.tsx` or `src/app/[locale]/designer/error.tsx`

**Fix direction:** Add a shared Designer loading skeleton shaped like the dashboard shell and an error boundary with a retry action. Keep the existing empty state for a valid zero-submission result.

### 2. HIGH — Mobile and compact-sidebar controls are below the app tap-target baseline

**Rules:** R-03, R-32

The mobile menu trigger and close control are `h-9 w-9` (36px), while the desktop collapse control is `h-8 w-8` (32px). The app's mobile audit standard targets approximately 44px controls. These controls are primary navigation actions and are more important than their compact visual treatment.

**Evidence:**
- `src/components/designer/DesignerSidebar.tsx:108`
- `src/components/designer/DesignerSidebar.tsx:117`
- `src/components/designer/DesignerSidebar.tsx:141`

**Fix direction:** Use a 40-44px hit area while keeping the icon visually 18-20px. Preserve the current layout dimensions by using an invisible or low-emphasis control surface rather than enlarging the icon.

### 3. MEDIUM — Faint metadata text is below normal-text contrast intent

**Rules:** R-25

The Designer surfaces use `text-ink-faint` for timestamps, sidebar metadata, and supporting labels. The token is `#9CA3AF`; on the light `#FFFFFF`/`#F5F7FB` surfaces it is a placeholder-level gray and is not suitable for normal-size readable metadata under WCAG AA. The same token is used for content users need to scan, not only decorative hints.

**Evidence:**
- `src/components/designer/DesignerDashboard.tsx:77`
- `src/components/designer/DesignerSidebar.tsx:63`
- `src/components/designer/DesignerSidebar.tsx:96`
- `docs/DESIGN.md:39-41`

**Fix direction:** Keep `text-ink-faint` for truly secondary/decorative labels only. Promote timestamps, email, and navigation context to `text-ink-soft`, then verify the resulting combinations with a contrast check.

### 4. MEDIUM — Submission form uses ad-hoc semantic sky colors instead of product tokens

**Rules:** R-01, R-20, DESIGN.md §2

The locked-submission notice uses `bg-sky-50 text-sky-800`, while the product design system explicitly defines `info-soft` and `info` semantic tokens and instructs UI code to use them instead of ad-hoc `sky-*` classes. This creates a visual exception between the Designer form and the rest of the app shell.

**Evidence:**
- `src/components/designer/SubmissionForm.tsx:122`
- `docs/DESIGN.md:47-60`

**Fix direction:** Replace the ad-hoc sky classes with `bg-info-soft text-info`, matching the existing status and banner vocabulary.

### 5. LOW — Repeated directional arrows dilute the navigation signal

**Rules:** R-08

The overview uses arrows on the “view all” link and every recent-submission row. The row arrow has a valid directional purpose, but the repeated arrow treatment makes the overview's secondary navigation visually louder than the status information it is meant to support.

**Evidence:**
- `src/components/designer/DesignerDashboard.tsx:61`
- `src/components/designer/DesignerDashboard.tsx:83`

**Fix direction:** Keep the arrow on each submission row because it signals drill-in. Remove it from the “view all” text link or use a quieter text-only treatment so only one directional cue dominates each navigation level.

## Passed Checks

- Palette follows `docs/DESIGN.md`; no blue-purple gradient or dark-mode default found in the audited Designer components.
- No fabricated statistics, testimonials, customer logos, or claims found. Status counts are derived from real `submissions` data.
- Designer sidebar destinations are real: overview, submissions, dashboard profile, and logout all have working behavior/routes.
- Empty submission states exist in both overview and list views, and form save/submit/upload errors are surfaced inline.
- The current shell uses one restrained blur layer for the mobile drawer backdrop; cards and the sidebar remain solid surfaces.
- The current worktree was previously verified with `npx tsc --noEmit`, `npm run lint`, and `npm run build`; this audit did not alter application source.

## Fix Order

1. Fix findings 1-2 first because they affect resilience and mobile access.
2. Fix findings 3-4 for contrast and token consistency.
3. Fix finding 5 only if the owner wants a quieter navigation hierarchy.

## Resolution

Owner selected findings **1-5** for implementation.

- **1 fixed:** Added `src/app/[locale]/designer/loading.tsx` with a shell-shaped loading state and `src/app/[locale]/designer/error.tsx` with localized retry behavior.
- **2 fixed:** Increased Designer mobile menu/close controls to 44px and the desktop collapse control to 40px without enlarging the icons.
- **3 fixed:** Promoted Designer metadata that users scan from `text-ink-faint` to `text-ink-soft`.
- **4 fixed:** Replaced the locked-submission notice's `sky-*` classes with `bg-info-soft text-info`.
- **5 fixed:** Removed the decorative arrow from the overview's “view all” link while retaining row arrows for drill-in navigation.

**Post-fix verification:** `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` clean, `git diff --check` clean, and `messages/id.json`/`messages/en.json` parse successfully.
