import { test, expect } from "@playwright/test";

test.describe("Flow 8 — Public Multi-Tenant Site Rendering", () => {
  test("Non-existent subdomain returns 404 page", async ({ page }) => {
    const response = await page.goto("/sites/non-existent-subdomain-12345");
    expect(response?.status()).toBe(404);
  });
});
