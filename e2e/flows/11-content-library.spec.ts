import { test, expect } from "@playwright/test";

test.describe("Flow 11 — Content Library", () => {
  test("Content Library hub redirects to /login when unauthenticated", async ({ page }) => {
    await page.goto("/id/dashboard/content");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  test("Per-workspace Content Library redirects to /login when unauthenticated", async ({ page }) => {
    await page.goto("/id/dashboard/some-workspace/content");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });
});