import { test, expect } from "@playwright/test";

test.describe("Portofio E2E Flow Regression Suite", () => {
  test("Flow 1: Landing Page renders marketing elements and templates", async ({ page }) => {
    await page.goto("/id");
    
    // Title / Brand presence
    await expect(page).toHaveTitle(/Portofio/);

    // Hero element check
    const heroHeading = page.locator("h1").first();
    await expect(heroHeading).toBeVisible();

    // Template Showcase section
    const templatesSection = page.locator("#templates");
    await expect(templatesSection).toBeVisible();
  });

  test("Flow 2: Auth Navigation & Form Inputs", async ({ page }) => {
    // Login page
    await page.goto("/id/login");
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Signup page navigation
    await page.goto("/id/signup");
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Forgot password page
    await page.goto("/id/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("Flow 3: Public Template Gallery Page", async ({ page }) => {
    await page.goto("/id/templates");
    
    // Check that gallery heading or cards render
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("Flow 7: Privacy Policy & Terms of Service Pages", async ({ page }) => {
    await page.goto("/id/privacy");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/id/terms");
    await expect(page.locator("h1")).toBeVisible();
  });
});
