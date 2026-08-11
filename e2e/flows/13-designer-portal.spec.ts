import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const INTEGRATION_ON =
  process.env.E2E_DESIGNER_INTEGRATION === "1" || process.env.E2E_DESIGNER_INTEGRATION === "true";

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
    throw new Error("Missing Supabase env for Designer integration test.");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function createRoleUser(
  admin: SupabaseClient,
  role: "designer" | "admin",
  prefix: string,
) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `${prefix}-${suffix}@example.com`;
  const password = `Passw0rd!${suffix}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `${role} E2E` },
  });
  if (error || !data.user) throw error ?? new Error(`Failed to create ${role}`);

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", data.user.id);
  if (roleError) throw roleError;

  return { id: data.user.id, email, password };
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/id/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/id\/(dashboard|designer|admin)/, { timeout: 15000 });
}

test.describe("Flow 13 — Designer Portal integration", () => {
  test.skip(!INTEGRATION_ON, "Set E2E_DESIGNER_INTEGRATION=1 to run against real Supabase.");

  test("designer submits, revises, and gets approved by Admin", async ({ page, browser }) => {
    const admin = adminClient();
    const designer = await createRoleUser(admin, "designer", "e2e-designer");
    const otherDesigner = await createRoleUser(admin, "designer", "e2e-other-designer");
    const reviewer = await createRoleUser(admin, "admin", "e2e-reviewer");
    let submissionId: string | null = null;
    let sourcePath: string | null = null;
    const adminPage = await browser.newPage();
    const otherDesignerPage = await browser.newPage();

    try {
      await login(page, designer.email, designer.password);
      await page.goto("/id/designer/submissions/new");
      await expect(page.getByRole("heading", { name: "Submission baru" })).toBeVisible();

      await page.getByLabel("Nama template").fill("Mono Studio E2E");
      await page.getByLabel("Deskripsi").fill("Template editorial untuk portfolio designer dan creative professional.");
      await page.getByLabel("URL preview desktop").fill("https://example.com/mono-studio");
      await page.getByLabel("URL preview mobile").fill("https://example.com/mono-studio-mobile");
      await page.getByLabel("Tags").fill("portfolio, editorial, creative");
      await page.getByLabel("Lisensi dan kepemilikan asset").fill("Original assets owned by designer");
      await page.locator('input[type="file"]').setInputFiles({
        name: "mono-studio.zip",
        mimeType: "application/zip",
        buffer: Buffer.from("PK\x03\x04designer-e2e"),
      });
      await page.getByRole("button", { name: "Kirim untuk review" }).click();
      await page.waitForURL(/\/id\/designer\/submissions\/[0-9a-f-]+$/);
      submissionId = page.url().split("/").pop() ?? null;
      expect(submissionId).toMatch(/^[0-9a-f-]{36}$/i);
      await expect(page.getByText("Menunggu review")).toBeVisible();

      const { data: pending } = await admin
        .from("template_submissions")
        .select("id, status, source_path")
        .eq("id", submissionId)
        .single();
      expect(pending?.status).toBe("pending");
      sourcePath = pending?.source_path ?? null;
      expect(sourcePath).toContain(`${designer.id}/${submissionId}/`);

      await login(otherDesignerPage, otherDesigner.email, otherDesigner.password);
      await otherDesignerPage.goto(`/id/designer/submissions/${submissionId}`);
      await otherDesignerPage.waitForURL("**/id/designer/submissions*", { timeout: 15000 });
      expect(otherDesignerPage.url()).not.toContain(submissionId);

      await login(adminPage, reviewer.email, reviewer.password);
      await adminPage.goto("/id/admin/templates");
      const row = adminPage.locator("tr", { hasText: "Mono Studio E2E" });
      await expect(row).toBeVisible();

      const dialogs: string[] = [];
      adminPage.on("dialog", async (dialog) => {
        dialogs.push(dialog.message());
        if (dialog.message().includes("revision")) {
          await dialog.accept("Please add a stronger mobile preview.");
        } else if (dialog.message().includes("after the template is merged")) {
          await dialog.accept("mono-studio-e2e");
        } else {
          await dialog.accept("");
        }
      });
      await row.getByRole("button", { name: "Review" }).click();
      await row.getByRole("button", { name: "Request Revision" }).click();
      await expect(row.getByText("revision_requested", { exact: true })).toBeVisible();

      await page.goto(`/id/designer/submissions/${submissionId}`);
      await expect(page.getByText("Perlu revisi")).toBeVisible();
      await page.getByLabel("Deskripsi").fill("Template editorial yang diperbarui untuk designer dan creative professional.");
      await page.getByRole("button", { name: "Kirim untuk review" }).click();
      await expect(page.getByText("Menunggu review")).toBeVisible();

      await adminPage.reload();
      const revisedRow = adminPage.locator("tr", { hasText: "Mono Studio E2E" });
      await revisedRow.getByRole("button", { name: "Review" }).click();
      await revisedRow.getByRole("button", { name: "Approve" }).click();
      await expect(revisedRow.getByText("approved", { exact: true })).toBeVisible();

      if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !submissionId) {
        throw new Error("Missing anon key or submission ID for RLS assertion");
      }
      const designerClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await designerClient.auth.signInWithPassword({ email: designer.email, password: designer.password });
      const { data: tamperedRows } = await designerClient
        .from("template_submissions")
        .update({ status: "rejected", review_notes: "tampered" })
        .eq("id", submissionId)
        .select("id, status, review_notes");
      expect(tamperedRows ?? []).toHaveLength(0);

      await adminPage.reload();
      const approvedRow = adminPage.locator("tr", { hasText: "Mono Studio E2E" });
      const integration = approvedRow.locator("select");
      await expect(integration).toHaveValue("in_review");
      await integration.selectOption("merged");
      await expect(integration).toHaveValue("merged");
      await adminPage.waitForTimeout(500);

      const { data: approved } = await admin
        .from("template_submissions")
        .select("status, integration_status, registry_id")
        .eq("id", submissionId)
        .single();
      expect(approved).toMatchObject({
        status: "approved",
        integration_status: "merged",
        registry_id: "mono-studio-e2e",
      });

      if (!sourcePath) throw new Error("Source path was not persisted");
      const publicSourceUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/template-submissions/${sourcePath}`;
      const publicResponse = await adminPage.request.get(publicSourceUrl);
      expect(publicResponse.status()).not.toBe(200);
      expect(dialogs.length).toBeGreaterThan(0);
    } finally {
      await adminPage.close();
      await otherDesignerPage.close();
      if (submissionId) {
        await admin.from("template_submissions").delete().eq("id", submissionId);
      }
      if (sourcePath) {
        await admin.storage.from("template-submissions").remove([sourcePath]);
      }
      await admin.auth.admin.deleteUser(designer.id);
      await admin.auth.admin.deleteUser(otherDesigner.id);
      await admin.auth.admin.deleteUser(reviewer.id);
    }
  });
});
