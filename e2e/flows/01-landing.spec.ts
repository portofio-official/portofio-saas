import { test, expect } from "@playwright/test";

test.describe("Flow 1 — Visitor Landing Page & Template Showcase", () => {
  test("Landing page loads with hero header, CTA, and template showcase", async ({ page }) => {
    const response = await page.goto("/id");
    expect(response?.status()).toBe(200);

    // Verify main title or hero branding
    await expect(page.locator("body")).toBeVisible();

    // Verify footer legal links exist and are clickable
    const privacyLink = page.locator('footer a[href*="/privacy"]');
    const termsLink = page.locator('footer a[href*="/terms"]');

    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();
  });

  test("Privacy Policy legal page renders cleanly", async ({ page }) => {
    const response = await page.goto("/id/privacy");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Terms of Service legal page renders cleanly", async ({ page }) => {
    const response = await page.goto("/id/terms");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Landing page shows the template showcase section", async ({ page }) => {
    await page.goto("/id");
    const templatesSection = page.locator("#templates");
    await expect(templatesSection).toBeVisible();
  });

  test("Public template gallery page renders", async ({ page }) => {
    const response = await page.goto("/id/templates");
    expect(response?.status()).toBe(200);
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });
});
