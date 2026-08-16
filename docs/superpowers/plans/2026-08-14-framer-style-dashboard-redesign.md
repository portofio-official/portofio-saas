# Framer-Style Ultra-Clean Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Portofio User Dashboard into a world-class, Framer-inspired experience characterized by ultra-clean spatial canvas layouts, responsive Grid vs List view switching, live framed project cards with device chrome, lightning-fast ⌘K search/filter controls, and tactile micro-motion.

**Architecture:** Maintain Next.js 16 App Router client/server boundaries, leveraging Tailwind CSS design tokens (`DESIGN.md` light mode), Framer Motion for spring physics (`stiffness: 400, damping: 30`), localized i18n (`next-intl`), and clean component decomposition (`DashboardHeader`, `DashboardToolbar`, `WorkspaceGrid`, `WorkspaceListView`, `WorkspaceCard`, `DashboardQuickPreviewModal`).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, next-intl, Playwright for E2E verification.

## Global Constraints

- **Theme Mode:** Light mode only (Strict `DESIGN.md` rule §16 — no `dark:` variants).
- **Typography:** Outfit (Display/Headings), Inter (UI/Body), Geist Mono (Tabular numbers).
- **Brand Accent:** Brand green (`#00cf7c` / `#00b368`), background canvas (`#F4F6F9`), cards (`#FFFFFF`).
- **Icons:** Material Symbols Outlined exclusively.
- **Testing:** Playwright E2E suites must maintain 100% pass rate with zero regression.

---

## File Structure & Responsibility Map

```
src/
├── components/dashboard/
│   ├── DashboardClientView.tsx       # Main orchestrator (state, keyboard shortcuts, view mode)
│   ├── DashboardSidebar.tsx          # Framer-style minimal floating dock/sidebar with spring transitions
│   ├── components/
│   │   ├── DashboardHeader.tsx       # Framer-tier minimal display header, live status, nested CTA
│   │   ├── DashboardToolbar.tsx      # Search bar with ⌘K, All/Live/Draft segmented pills, Grid/List toggle, Sort
│   │   ├── WorkspaceGrid.tsx         # Responsive multi-column Framer canvas card grid
│   │   ├── WorkspaceListView.tsx     # High-density, professional Framer-style table/list view
│   │   ├── WorkspaceCard.tsx         # Framer-grade project card (mini device frame, hover actions, double bezel)
│   │   ├── WorkspaceListItem.tsx     # Clean data row for list view (status dot, domain, visitor count, edit time)
│   │   ├── CreateWorkspaceCard.tsx   # Dashed canvas card with glowing hover interaction
│   │   └── QuickPreviewModal.tsx     # Smooth modal preview with desktop/tablet/mobile viewport switchers
```

---

## Phased Tasks

### Task 1: Framer-Style View Mode Architecture & State (Grid vs List View)

**Files:**
- Modify: `src/components/dashboard/DashboardClientView.tsx`
- Create: `src/components/dashboard/components/DashboardToolbar.tsx`
- Modify: `messages/en.json` & `messages/id.json`

**Interfaces:**
- Consumes: `Workspace[]`, `Dict`, `preferredTemplateId`
- Produces: `viewMode: 'grid' | 'list'` stored in `localStorage`, unified filter/search/sort handlers.

- [ ] **Step 1: Add i18n keys for view switcher (Grid / List) & list headers**
  Add `viewGrid`, `viewList`, `colName`, `colStatus`, `colDomain`, `colLastEdited`, `colActions` to `Dashboard` namespace in `messages/en.json` and `messages/id.json`.

- [ ] **Step 2: Create `DashboardToolbar.tsx`**
  Build Framer-grade toolbar with:
  1. Instant Search with auto-focus, `⌘K` badge, clear button.
  2. Segmented Pill Filter (`All / Live / Draft`) with smooth layout spring pill.
  3. Sort dropdown selector.
  4. View Mode Switcher (`grid_view` vs `view_list`) toggle button group with active indicator.

- [ ] **Step 3: Wire `localStorage` persistence for `viewMode` in `DashboardClientView.tsx`**
  Persist user preference (`portofio_dashboard_view_mode: 'grid' | 'list'`) across sessions.

- [ ] **Step 4: Verify TypeScript compilation & linting**
  Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/dashboard/ messages/
  git commit -m "feat(dashboard): add Framer-grade toolbar with Grid/List view mode toggle"
  ```

---

### Task 2: Framer-Style Project Card (Double-Bezel & Live Device Frame)

**Files:**
- Create: `src/components/dashboard/components/WorkspaceCard.tsx`
- Create: `src/components/dashboard/components/CreateWorkspaceCard.tsx`
- Create: `src/components/dashboard/components/WorkspaceGrid.tsx`
- Modify: `src/components/dashboard/DashboardClientView.tsx`

**Interfaces:**
- Consumes: `workspace: Workspace`, `onPreview`, `onDuplicate`, `onUnpublish`, `onDelete`
- Produces: Polished interactive canvas card with Framer-like browser header, iframe preview, quick floating action bar on hover, and smooth menu.

- [ ] **Step 1: Build `WorkspaceCard.tsx` with Framer aesthetics**
  1. Outer bezel: `rounded-[20px] bg-black/[0.02] p-1.5 ring-1 ring-black/[0.06] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300`
  2. Inner canvas: `rounded-[14px] bg-surface ring-1 ring-black/[0.04]`
  3. Framer-style browser pill header: 3 minimal window dots, address bar pill with SSL lock / draft indicator.
  4. Preview frame with scale transition (`scale-[1.03]` on hover).
  5. Floating glass action pills on hover: "Edit", "Preview", "Visit Live", "Unpublish".
  6. Card footer with clean typography (Outfit 15px bold, status pill, time ago).

- [ ] **Step 2: Build `CreateWorkspaceCard.tsx`**
  Interactive dashed canvas card with animated plus icon wrapper and glowing green hover states.

- [ ] **Step 3: Build `WorkspaceGrid.tsx`**
  Fluid responsive masonry/grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`) with staggered fade-in entry animations.

- [ ] **Step 4: Verify compilation & layout**
  Run: `npx tsc --noEmit && npm run build`

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/dashboard/
  git commit -m "feat(dashboard): implement Framer-style WorkspaceCard and responsive WorkspaceGrid"
  ```

---

### Task 3: Framer-Style High-Density List View

**Files:**
- Create: `src/components/dashboard/components/WorkspaceListItem.tsx`
- Create: `src/components/dashboard/components/WorkspaceListView.tsx`
- Modify: `src/components/dashboard/DashboardClientView.tsx`

**Interfaces:**
- Consumes: `workspaces: Workspace[]`, actions callbacks
- Produces: Professional table/list view for power users managing multiple portfolio sites.

- [ ] **Step 1: Build `WorkspaceListItem.tsx`**
  Row item featuring:
  1. Mini thumbnail preview square with rounded corners.
  2. Website name and template tag.
  3. Status badge (Pulsing green Live pill / Draft badge).
  4. Subdomain link (`subdomain.portofio.app`) with `open_in_new`.
  5. Localized last edited time (`Intl.RelativeTimeFormat`).
  6. Quick hover action buttons: Edit button, Preview icon, More options dropdown.

- [ ] **Step 2: Build `WorkspaceListView.tsx`**
  Table container with clean sticky header, subtle row dividers (`border-black/[0.04]`), and hover highlight states (`hover:bg-black/[0.015]`).

- [ ] **Step 3: Connect List View to `DashboardClientView.tsx`**
  Conditionally render `WorkspaceGrid` or `WorkspaceListView` based on `viewMode`.

- [ ] **Step 4: Verify test suite**
  Run: `npx playwright test`

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/dashboard/
  git commit -m "feat(dashboard): implement high-density Framer-style List View"
  ```

---

### Task 4: Interactive Multi-Device Quick Preview Modal

**Files:**
- Create: `src/components/dashboard/components/QuickPreviewModal.tsx`
- Modify: `src/components/dashboard/DashboardClientView.tsx`

**Interfaces:**
- Consumes: `workspace: Workspace`, `onClose`
- Produces: Interactive preview modal with device frame switcher (Desktop 100%, Tablet 768px, Mobile 375px), direct editor link, and visit live link.

- [ ] **Step 1: Build `QuickPreviewModal.tsx`**
  1. Backdrop: `fixed inset-0 z-50 bg-ink/60 backdrop-blur-md flex items-center justify-center p-4`
  2. Modal container: Double-bezel window with title, status pill, and device viewport switcher (Desktop / Tablet / Mobile).
  3. Dynamic viewport container: Centered frame that animates smoothly between widths (`w-full`, `max-w-[768px]`, `max-w-[390px]`).
  4. Top actions: "Open Editor" accent pill CTA, "Visit Live" button, Close `X` button.

- [ ] **Step 2: Wire up modal in `DashboardClientView.tsx`**
  Replace inline modal markup with modular `QuickPreviewModal` component.

- [ ] **Step 3: Verification & build**
  Run: `npx tsc --noEmit && npm run build`

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/dashboard/
  git commit -m "feat(dashboard): add interactive multi-device QuickPreviewModal"
  ```

---

### Task 5: End-to-End Testing & Verification

**Files:**
- Create: `e2e/flows/16-dashboard-framer-ui.spec.ts`
- Modify: `claude-progress.md`
- Modify: `feature_list.json`

- [ ] **Step 1: Write E2E tests for Framer dashboard features**
  Cover view switching (Grid ↔ List), search filtering with ⌘K, sort changes, quick preview modal opening, and device switcher toggles.

- [ ] **Step 2: Run full verification suite**
  Run: `./init.sh && npx playwright test`

- [ ] **Step 3: Record evidence in `claude-progress.md` and `feature_list.json`**

- [ ] **Step 4: Final commit**
  ```bash
  git add e2e/ claude-progress.md feature_list.json
  git commit -m "test(dashboard): add E2E verification for Framer UI redesign"
  ```
