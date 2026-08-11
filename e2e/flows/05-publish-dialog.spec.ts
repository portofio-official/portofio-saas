import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Integration test for the Editor Publish flow (FLOW 5).
// Requires a real Supabase project (admin/service-role access) and is opt-in:
//   E2E_PUBLISH_INTEGRATION=1 npm run test:e2e
// Otherwise the suite skips this spec so default runs stay backend-independent.

const INTEGRATION_ON =
  process.env.E2E_PUBLISH_INTEGRATION === "1" || process.env.E2E_PUBLISH_INTEGRATION === "true";

function loadEnv(): Record<string, string> {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
      if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
    }
    return out;
  } catch {
    return {};
  }
}

const env = loadEnv();

function adminClient(): SupabaseClient {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env for integration test.");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const now = new Date().toISOString();
const demoDocument = {
  meta: {
    templateId: "minimal",
    templateVersion: 1,
    createdAt: now,
    updatedAt: now,
    locale: "id",
  },
  data: {
    profile: {
      fullName: "Test User",
      headline: "Frontend Engineer",
      bio: "Building things.",
      photoUrl: "https://example.com/avatar.png",
    },
    contact: { email: "test@example.com", phone: "0812" },
    projects: [
      {
        title: "Portfolio Site",
        description: "A portfolio builder.",
        url: "https://portofio.id",
        imageUrl: "",
        tags: ["web"],
      },
    ],
  },
};

test.describe("Flow 5 — Editor Publish Dialog (subdomain + subscription gate)", () => {
  test.skip(!INTEGRATION_ON, "Set E2E_PUBLISH_INTEGRATION=1 to run against real Supabase.");

  let userId: string;
  let workspaceId: string;
  let projectId: string;
  let email: string;
  let password: string;

  test.beforeAll(async () => {
    if (!INTEGRATION_ON) return;

    const admin = adminClient();
    const suffix = Date.now().toString(36);
    email = `e2e-publish-${suffix}@example.com`;
    password = `Passw0rd!${suffix}`;

    const { data: user, error: userErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Test User" },
    });
    if (userErr || !user?.user) throw userErr ?? new Error("createUser failed");
    userId = user.user.id;

    if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { error: signInErr } = await anon.auth.signInWithPassword({ email, password });
      console.log("[debug] direct signIn error:", signInErr ? `${signInErr.status} ${signInErr.message}` : "none");
    }

    const { data: ws } = await admin
      .from("workspaces")
      .insert({ user_id: userId, name: "E2E Publish WS" })
      .select("id")
      .single();
    if (!ws) throw new Error("insert workspace failed");
    workspaceId = ws.id;

    // Insert a draft project (WebsiteDocument) and its initial version, then
    // point the project's current_version_id at that version.
    const { data: project, error: projectErr } = await admin
      .from("projects")
      .insert({
        workspace_id: workspaceId,
        name: "E2E Publish Project",
        template_id: "minimal",
        template_version: 1,
        status: "draft",
        profile_synced_at: now,
      })
      .select("id")
      .single();
    if (projectErr || !project) throw projectErr ?? new Error("insert project failed");
    projectId = project.id;

    const { data: version } = await admin
      .from("project_versions")
      .insert({
        project_id: projectId,
        version_number: 1,
        content_json: demoDocument,
        schema_version: 1,
        is_autosave: false,
      })
      .select("id")
      .single();
    if (!version) throw new Error("insert version failed");

    const { error: vErr } = await admin
      .from("projects")
      .update({ current_version_id: version.id })
      .eq("id", projectId);
    if (vErr) throw vErr;
  });

  test.afterAll(async () => {
    if (!INTEGRATION_ON || !userId) return;
    const admin = adminClient();
    // Workspace cascade-deletes projects + project_versions.
    await admin.from("workspaces").delete().eq("user_id", userId);
    await admin.auth.admin.deleteUser(userId);
  });

  test("Publish opens subdomain dialog, sanitizes input, previews URL, shows subscription CTA", async ({
    page,
  }) => {
    if (!INTEGRATION_ON) return;

    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing anon keys for integration test.");
    }

    page.on("pageerror", (e) => console.log("[pageerror]", e.message));
    page.on("console", (m) => {
      if (m.type() === "error") console.log("[console:error]", m.text());
    });
    page.on("request", (req) => {
      if (req.method() !== "GET") console.log("[request]", req.method(), req.url());
    });
    page.on("response", (res) => {
      if (res.status() >= 400) console.log("[response]", res.status(), res.url());
    });
    page.on("response", async (res) => {
      if (res.url().endsWith("/id/login") && ["POST"].includes(res.request().method())) {
        const text = await res.text().catch(() => "");
        console.log("[login-response]", text.slice(0, 900));
      }
    });

    // Log in through the real UI so the SSR session cookie is set.
    await page.goto("/id/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    console.log("[debug] URL after login submit:", page.url());
    console.log("[debug] alert text:", await page.locator("p[class*='text']").allTextContents());
    console.log("[debug] body:", (await page.locator("body").innerText()).slice(0, 600));

    // Navigate to the editor for our seeded project.
    await page.goto(`/id/dashboard/${workspaceId}/editor`);
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();

    await page.getByRole("button", { name: "Open version history" }).click();
    await expect(page.getByRole("heading", { name: "Version history" })).toBeVisible();
    await expect(page.getByText(/Version 1/)).toBeVisible();
    await page.getByRole("button", { name: "Close version history" }).click();

    // Click Publish: data is complete (name/photo/project), so the subdomain
    // dialog opens instead of the readiness modal.
    await page.getByRole("button", { name: "Publish" }).click();
    const dialog = page.getByText("Publish Website");
    await expect(dialog).toBeVisible();

    const input = page.locator('input[placeholder="namamu"]');
    await expect(input).toBeVisible();

    // Sanitization: uppercase + invalid characters are stripped client-side.
    await input.fill("My Site !");
    await expect(input).toHaveValue("mysite");

    // Live URL preview updates.
    await expect(page.getByText(`sites/mysite`)).toBeVisible();

    // No subscription -> server returns requiresSubscription -> CTA shows.
    await page.getByRole("button", { name: "Publish" }).last().click();
    await expect(page.getByText("Berlangganan untuk publish website kamu.")).toBeVisible({
      timeout: 15000,
    });

    // Subdomain empty disables the publish button.
    await input.fill("");
    await expect(page.getByRole("button", { name: "Publish" }).last()).toBeDisabled();
  });
});
