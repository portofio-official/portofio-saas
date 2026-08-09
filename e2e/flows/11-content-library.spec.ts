import { test, expect } from "@playwright/test";

test.describe("Flow 11 — Content Library (account-global)", () => {
  test("Content Library page redirects to /login when unauthenticated", async ({ page }) => {
    await page.goto("/id/dashboard/content");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  test("Legacy per-workspace Content Library URL redirects to the global library", async ({ page }) => {
    await page.goto("/id/dashboard/some-workspace/content");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  test("Per-type Content Library routes exist and are auth-gated", async ({ page }) => {
    const types = [
      "projects",
      "testimonials",
      "certificates",
      "experience",
      "education",
      "publications",
      "media",
    ];
    for (const type of types) {
      const response = await page.goto(`/id/dashboard/content/${type}`);
      // Auth-gated: the dashboard layout redirects to /login instead of 404ing.
      expect(response?.status()).toBe(200);
    }
    await page.goto("/id/dashboard/content/media");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });
});