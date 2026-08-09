import { test, expect } from "@playwright/test";

test.describe("Flow 12 — Landing template preview isolation", () => {
  test("interacting inside the preview modal does not affect the landing page", async ({ page }) => {
    await page.goto("/id");

    // Open the preview modal for the active (center) coverflow card.
    const activeCard = page
      .locator("[class*='coverflowCard'][class*='active']")
      .first();
    await activeCard.hover();
    const eyeButton = activeCard.locator("button[title='Pratinjau']");
    await eyeButton.click();

    const modal = page.locator("[class*='bg-black/80']");
    await expect(modal).toBeVisible();

    const urlBefore = page.url();
    let hashChanged = false;
    page.on("hashchange", () => {
      hashChanged = true;
    });

    // The preview renders the first template (Minimal), whose footer always
    // includes a mailto: anchor. Clicking it must do nothing to the page.
    const previewLink = modal.locator("a[href^='mailto:']").first();
    await expect(previewLink).toBeVisible();
    await previewLink.click({ force: true });

    // Landing page must be untouched: URL unchanged, no hash navigation,
    // and the modal must still be open.
    expect(hashChanged).toBe(false);
    await expect(page).toHaveURL(urlBefore);
    await expect(modal).toBeVisible();
  });
});