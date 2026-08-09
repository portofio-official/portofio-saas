import { test, expect } from "@playwright/test";

test.describe("Flow 8 — Public Multi-Tenant Site Rendering", () => {
  test("Non-existent subdomain returns 404 page", async ({ page }) => {
    const response = await page.goto("/sites/non-existent-subdomain-12345");
    expect(response?.status()).toBe(404);
  });

  test("View beacon endpoint is POST-only", async ({ request }) => {
    const response = await request.get("/api/track");
    expect(response.status()).toBe(405);
  });

  test("Section beacon is ignored for unknown subdomains", async ({ request }) => {
    const response = await request.post("/api/track", {
      data: {
        type: "section",
        subdomain: "nonexistent-sprint2-xyz",
        path: "/",
        visitorHash: "t-spec-hash",
        section: { key: "projects", label: "Work" },
      },
    });
    expect(response.status()).toBe(204);
  });
});
