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
});