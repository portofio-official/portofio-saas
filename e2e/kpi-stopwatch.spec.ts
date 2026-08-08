import { test, expect } from "@playwright/test";

/**
 * C-2: KPI Smoke Test — Verifies all four public-facing pages load within
 * a meaningful time budget (<10 s each) and render expected UI elements.
 *
 * This is NOT an integration test — it does not require Supabase credentials.
 * It runs against the dev server (or a preview deployment) and checks static/
 * public pages only.
 *
 * Gap noted in FLOW_CLOSURE_PLAN.md: previous version only measured wall-clock
 * time for 4 gotos, which is meaningless as a KPI. Now we assert:
 *   1. Page loads within budget (TTFCP proxy via timing assertion)
 *   2. Expected landmark elements are present and visible
 *   3. No uncaught console errors on load
 */

const PAGE_LOAD_BUDGET_MS = 10_000; // 10 seconds per page

test.describe("C-2: Public Page Smoke Test (load time + landmark elements)", () => {
  const pages = [
    {
      url: "/id",
      name: "Landing Page",
      landmark: "h1",
    },
    {
      url: "/id/signup",
      name: "Sign-up Page",
      landmark: 'input[type="email"]',
    },
    {
      url: "/id/templates",
      name: "Template Gallery",
      landmark: "h1",
    },
    {
      url: "/id/login",
      name: "Login Page",
      landmark: 'input[type="email"]',
    },
  ];

  for (const { url, name, landmark } of pages) {
    test(`${name} — loads within ${PAGE_LOAD_BUDGET_MS}ms and renders landmark`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      const t0 = Date.now();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Assert landmark is visible
      const locator = page.locator(landmark).first();
      await expect(locator).toBeVisible({ timeout: PAGE_LOAD_BUDGET_MS });

      const elapsed = Date.now() - t0;
      console.log(`[KPI] ${name}: ${elapsed}ms`);

      // Assert within budget
      expect(
        elapsed,
        `${name} loaded in ${elapsed}ms — exceeds ${PAGE_LOAD_BUDGET_MS}ms budget`,
      ).toBeLessThan(PAGE_LOAD_BUDGET_MS);

      // Assert no uncaught errors
      expect(
        errors.filter((e) => !e.includes("favicon")),
        `Unexpected console errors on ${name}`,
      ).toHaveLength(0);
    });
  }
});
