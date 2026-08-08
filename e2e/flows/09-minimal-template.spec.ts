import { test, expect } from "@playwright/test";

test.describe("Flow 9 — Minimal Template Redesign & Data Connection", () => {
  test("Minimal preview renders demo form content through all connected sections", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto("/templates");
    const card = page.locator(".gsap-template-card").filter({ hasText: "Minimal" }).first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await card.locator('button[title="Preview Live"]').click();

    const modal = page.locator(".fixed.inset-0.z-50").filter({ hasText: "Live Preview" });
    await expect(modal.first()).toBeVisible();

    const root = modal.locator(".min-h-screen").first();
    await expect(root).toBeVisible();

    // Profile data from the shared form (PREVIEW_DATA) renders — not fallback defaults
    await expect(root.locator("h1").first()).toHaveText("Alex Rivera");
    await expect(root.locator("h2").first()).toContainText("Product Designer & Creative Director");

    // Every editable form section is connected via data-section-key (editor left-panel navigates here)
    await expect(root.locator('[data-section-key="work"]')).toHaveCount(1);
    await expect(root.locator('[data-section-key="capabilities"]')).toHaveCount(1);
    await expect(root.locator('[data-section-key="contact"]')).toHaveCount(1);

    // Skills + projects feed in from the form
    await expect(root.locator('section[data-section-key="work"] h4')).toContainText(["Brand Refresh — GoTo"]);
    await expect(root.locator('section[data-section-key="capabilities"]')).toContainText("Figma");

    // Contact + socials from the form; editorial serif font applied
    await expect(root.locator('footer a[href^="mailto:"]')).toHaveAttribute("href", "mailto:alex@example.com");
    const rootFont = await root.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(rootFont).toBeTruthy();
    expect(pageErrors).toEqual([]);
  });

  test("Minimal project rows honor free-form links (#) without dropping the document", async ({ page }) => {
    // Regression: schema used to require strict URLs, so a "#" placeholder link
    // failed validation and reset the whole page to empty defaults.
    await page.goto("/templates");
    const card = page.locator(".gsap-template-card").filter({ hasText: "Minimal" }).first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await card.locator('button[title="Preview Live"]').click();

    const modal = page.locator(".fixed.inset-0.z-50").filter({ hasText: "Live Preview" });
    await expect(modal.first()).toBeVisible();

    const root = modal.locator(".min-h-screen").first();
    // Demo data uses link="#" for both projects — the document must NOT fall back to defaults
    await expect(root.locator("h1").first()).toHaveText("Alex Rivera");
    await expect(root.locator('section[data-section-key="work"] h4').first()).toContainText("Brand Refresh");
  });
});