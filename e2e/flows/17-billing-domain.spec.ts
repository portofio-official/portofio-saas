import { test, expect } from "@playwright/test";

// Smoke coverage for the SP2-032 billing/custom-domain surface (CustomDomainCard,
// Watermark, cancel/resume). Interactive coverage of adding/verifying a real
// domain, watermark render-per-tier, and cancel/resume requires a real
// authenticated account with an active paid subscription — same limitation
// already accepted for other billing-gated flows in this repo (see
// hardening-004/billing-002 notes: Midtrans webhook activation, cron
// fail-closed). What's checkable without one is the auth gate itself.
test.describe("Flow 17 — Billing & Custom Domain (auth gate)", () => {
  test("Billing page redirects to /login when unauthenticated", async ({ page }) => {
    await page.goto("/id/dashboard/billing");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });
});
