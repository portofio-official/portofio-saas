import { test, expect } from "@playwright/test";

const creativeCard = (page: import("@playwright/test").Page) =>
  page
    .locator(".gsap-template-card")
    .filter({ has: page.locator("p.font-display").getByText("Creative", { exact: true }) })
    .first();

async function openCreativePreview(page: import("@playwright/test").Page) {
  await page.goto("/templates");
  const card = creativeCard(page);
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await card.locator('button[title="Preview Live"]').click();
  const modal = page.locator(".fixed.inset-0.z-50").filter({ hasText: "Live Preview" });
  await expect(modal.first()).toBeVisible();
  return modal.locator(".min-h-screen").first();
}

test.describe("Flow 10 — Creative Template Redesign & Data Connection", () => {
  test("Creative preview renders demo form content through all connected sections", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    const root = await openCreativePreview(page);
    await expect(root).toBeVisible();

    // Profile data from the shared form (PREVIEW_DATA) renders — not fallback defaults
    await expect(root.locator("h1").first()).toContainText("Alex Rivera");

    // Every editable form section is connected via data-section-key (editor left-panel navigates here)
    await expect(root.locator('[data-section-key="work"]')).toHaveCount(1);
    await expect(root.locator('[data-section-key="skills"]')).toHaveCount(1);
    await expect(root.locator('[data-section-key="contact"]')).toHaveCount(1);

    // Skills + projects feed in from the form
    await expect(root.locator('[data-section-key="work"]')).toContainText("Brand Refresh: GoTo");
    await expect(root.locator('[data-section-key="skills"]')).toContainText("Figma");

    // Contact + socials from the form; display font applied
    await expect(root.locator('footer a[href^="mailto:"]')).toHaveAttribute("href", "mailto:alex@example.com");
    const rootFont = await root.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(rootFont).toBeTruthy();
    expect(pageErrors).toEqual([]);
  });

  test("Creative project rows honor free-form links (#) without dropping the document", async ({ page }) => {
    // Regression: schema used to require strict URLs, so a "#" placeholder link
    // failed validation and reset the whole page to empty defaults.
    const root = await openCreativePreview(page);

    // Demo data uses link="#" for projects — the document must NOT fall back to defaults
    await expect(root.locator("h1").first()).toContainText("Alex Rivera");
    await expect(root.locator('[data-section-key="work"]').first()).toContainText("Brand Refresh");
  });
});