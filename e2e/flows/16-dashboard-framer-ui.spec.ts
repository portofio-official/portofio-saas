import { test, expect } from "@playwright/test";

test.describe("Flow 16 — Dashboard UI", () => {
  test("Unauthenticated /id/dashboard redirects to /id/login", async ({ page }) => {
    await page.goto("/id/dashboard");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });
});
