import { test, expect } from "@playwright/test";

test.describe("Flow 2 — Authentication & Onboarding Protection", () => {
  test("Login page renders cleanly with email/password form", async ({ page }) => {
    const response = await page.goto("/id/login");
    expect(response?.status()).toBe(200);

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("Signup page renders cleanly", async ({ page }) => {
    const response = await page.goto("/id/signup");
    expect(response?.status()).toBe(200);

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("Unauthenticated access to /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/id/dashboard");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });
});
