import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const INTEGRATION_ON =
  process.env.E2E_ADMIN_INTEGRATION === "1" || process.env.E2E_ADMIN_INTEGRATION === "true";

function loadEnv(): Record<string, string> {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    const values: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) values[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
    }
    return values;
  } catch {
    return {};
  }
}

const env = loadEnv();

function adminClient(): SupabaseClient {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env for Admin integration test.");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function createUser(admin: SupabaseClient, role: "admin" | "user") {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e-admin-${role}-${suffix}@example.com`;
  const password = `Passw0rd!${suffix}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `${role} Admin E2E` },
  });
  if (error || !data.user) throw error ?? new Error(`Failed to create ${role}`);

  const { error: roleError } = await admin.from("profiles").update({ role }).eq("id", data.user.id);
  if (roleError) throw roleError;
  return { id: data.user.id, email, password };
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/en/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/en\/(dashboard|designer|admin)/, { timeout: 15000 });
}

test.describe("Flow 14 — Admin control plane", () => {
  test.skip(!INTEGRATION_ON, "Set E2E_ADMIN_INTEGRATION=1 after applying the Admin audit migration.");

  test("admin manages roles, suspension, moderation, templates, and audit history", async ({ page, browser }) => {
    test.setTimeout(120_000);
    const admin = adminClient();
    const adminUser = await createUser(admin, "admin");
    const targetUser = await createUser(admin, "user");
    const targetPage = await browser.newPage();
    const blocklistSlug = `e2e-reserved-${Date.now().toString(36)}`;
    let originalTemplateVisibility = true;

    try {
      const { data: template } = await admin
        .from("templates")
        .select("is_active")
        .eq("id", "minimal")
        .single();
      originalTemplateVisibility = template?.is_active ?? true;

      await login(page, adminUser.email, adminUser.password);
      await page.goto("/en/admin/users");
      const userRow = page.locator("tr", { hasText: targetUser.email });
      await expect(userRow).toBeVisible();

      await userRow.locator('select[aria-label="User role"]').selectOption("designer");
      await expect.poll(async () => {
        const { data } = await admin.from("profiles").select("role").eq("id", targetUser.id).single();
        return data?.role;
      }).toBe("designer");

      await userRow.getByRole("button", { name: "Suspend" }).click();
      await userRow.getByRole("button", { name: "Yes" }).click();
      await expect.poll(async () => {
        const { data } = await admin.auth.admin.getUserById(targetUser.id);
        return Boolean(data.user?.banned_until);
      }).toBe(true);

      await page.reload();
      const suspendedRow = page.locator("tr", { hasText: targetUser.email });
      await suspendedRow.getByRole("button", { name: "Reactivate" }).click();
      await suspendedRow.getByRole("button", { name: "Yes" }).click();
      await expect.poll(async () => {
        const { data } = await admin.auth.admin.getUserById(targetUser.id);
        return Boolean(data.user?.banned_until);
      }).toBe(false);

      await page.goto("/en/admin/blocklist");
      await page.getByPlaceholder("e.g. billing, status, static").fill(blocklistSlug);
      await page.getByRole("button", { name: "Add Word" }).click();
      await expect.poll(async () => {
        const { data } = await admin.from("subdomain_blocklist").select("slug").eq("slug", blocklistSlug).maybeSingle();
        return data?.slug;
      }).toBe(blocklistSlug);

      const blockedChip = page.getByText(blocklistSlug, { exact: true });
      await blockedChip.locator("..").getByRole("button").click();
      await page.getByRole("button", { name: "Yes" }).click();
      await expect.poll(async () => {
        const { data } = await admin.from("subdomain_blocklist").select("slug").eq("slug", blocklistSlug).maybeSingle();
        return data?.slug ?? null;
      }).toBeNull();

      await page.goto("/en/admin/templates");
      const templateCard = page.getByTestId("template-card-minimal");
      const visibilityButton = templateCard.getByRole("button");
      await visibilityButton.click();
      await expect.poll(async () => {
        const { data } = await admin.from("templates").select("is_active").eq("id", "minimal").single();
        return data?.is_active;
      }).toBe(!originalTemplateVisibility);
      await page.reload();
      await page.getByTestId("template-card-minimal").getByRole("button").click();

      await page.goto("/en/admin/audit-log");
      await expect(page.getByRole("heading", { name: /audit/i })).toBeVisible();
      // Audit log now renders human-readable sentences (Session 113 redesign)
      // instead of raw action strings — assert on the translated copy.
      await expect(page.getByText(/changed the role to/).first()).toBeVisible();
      await expect(page.getByText(/(suspended|reactivated) the account/).first()).toBeVisible();
      await expect(page.getByText(/subdomain to the blocklist/).first()).toBeVisible();
      await expect(page.getByText(/(made the template visible|hid the template)/).first()).toBeVisible();

      await login(targetPage, targetUser.email, targetUser.password);
      await targetPage.goto("/en/admin", { waitUntil: "domcontentloaded" });
      await targetPage.waitForURL((url) => !url.pathname.includes("/admin"), { timeout: 15000 });
      expect(targetPage.url()).not.toContain("/admin");
    } finally {
      await targetPage.close();
      await admin.from("subdomain_blocklist").delete().eq("slug", blocklistSlug);
      await admin.from("templates").update({ is_active: originalTemplateVisibility }).eq("id", "minimal");
      await admin.auth.admin.deleteUser(targetUser.id);
      await admin.auth.admin.deleteUser(adminUser.id);
    }
  });
});
