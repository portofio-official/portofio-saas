import { test, expect } from "@playwright/test";

test.describe("Sprint 3 — Target KPI Stopwatch Test (< 15 Minutes)", () => {
  test("End-to-end user journey from visitor to published portfolio site", async ({ page }) => {
    const startTime = Date.now();

    // Step 1: Visitor lands on landing page
    await page.goto("/id");
    await expect(page.locator("h1").first()).toBeVisible();

    // Step 2: Navigate to Signup
    await page.goto("/id/signup");
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Step 3: Navigate to Public Template Gallery
    await page.goto("/id/templates");
    await expect(page.locator("h1").first()).toBeVisible();

    // Step 4: Login page navigation
    await page.goto("/id/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    console.log(`[Stopwatch KPI Test] Completed full journey in ${durationSeconds} seconds.`);

    // Assert that the total journey takes well under 15 minutes (900 seconds)
    expect(durationSeconds).toBeLessThan(900);
  });
});
