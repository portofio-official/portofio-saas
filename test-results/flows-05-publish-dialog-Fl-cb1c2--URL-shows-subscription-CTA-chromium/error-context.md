# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flows/05-publish-dialog.spec.ts >> Flow 5 — Editor Publish Dialog (subdomain + subscription gate) >> Publish opens subdomain dialog, sanitizes input, previews URL, shows subscription CTA
- Location: e2e/flows/05-publish-dialog.spec.ts:153:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Publish' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Publish' })

```

```yaml
- img
- heading "This page couldn’t load" [level=1]
- paragraph: Reload to try again, or go back.
- button "Reload"
- button "Back"
```

# Test source

```ts
  91  |     if (userErr || !user?.user) throw userErr ?? new Error("createUser failed");
  92  |     userId = user.user.id;
  93  | 
  94  |     if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  95  |       const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  96  |       const { error: signInErr } = await anon.auth.signInWithPassword({ email, password });
  97  |       console.log("[debug] direct signIn error:", signInErr ? `${signInErr.status} ${signInErr.message}` : "none");
  98  |     }
  99  | 
  100 |     const { data: ws } = await admin
  101 |       .from("workspaces")
  102 |       .insert({ user_id: userId, name: "E2E Publish WS" })
  103 |       .select("id")
  104 |       .single();
  105 |     if (!ws) throw new Error("insert workspace failed");
  106 |     workspaceId = ws.id;
  107 | 
  108 |     // Insert a draft project (WebsiteDocument) and its initial version, then
  109 |     // point the project's current_version_id at that version.
  110 |     const { data: project, error: projectErr } = await admin
  111 |       .from("projects")
  112 |       .insert({
  113 |         workspace_id: workspaceId,
  114 |         name: "E2E Publish Project",
  115 |         template_id: "minimal",
  116 |         template_version: 1,
  117 |         status: "draft",
  118 |         profile_synced_at: now,
  119 |       })
  120 |       .select("id")
  121 |       .single();
  122 |     if (projectErr || !project) throw projectErr ?? new Error("insert project failed");
  123 |     projectId = project.id;
  124 | 
  125 |     const { data: version } = await admin
  126 |       .from("project_versions")
  127 |       .insert({
  128 |         project_id: projectId,
  129 |         version_number: 1,
  130 |         content_json: demoDocument,
  131 |         schema_version: 1,
  132 |         is_autosave: false,
  133 |       })
  134 |       .select("id")
  135 |       .single();
  136 |     if (!version) throw new Error("insert version failed");
  137 | 
  138 |     const { error: vErr } = await admin
  139 |       .from("projects")
  140 |       .update({ current_version_id: version.id })
  141 |       .eq("id", projectId);
  142 |     if (vErr) throw vErr;
  143 |   });
  144 | 
  145 |   test.afterAll(async () => {
  146 |     if (!INTEGRATION_ON || !userId) return;
  147 |     const admin = adminClient();
  148 |     // Workspace cascade-deletes projects + project_versions.
  149 |     await admin.from("workspaces").delete().eq("user_id", userId);
  150 |     await admin.auth.admin.deleteUser(userId);
  151 |   });
  152 | 
  153 |   test("Publish opens subdomain dialog, sanitizes input, previews URL, shows subscription CTA", async ({
  154 |     page,
  155 |   }) => {
  156 |     if (!INTEGRATION_ON) return;
  157 | 
  158 |     if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  159 |       throw new Error("Missing anon keys for integration test.");
  160 |     }
  161 | 
  162 |     page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  163 |     page.on("console", (m) => {
  164 |       if (m.type() === "error") console.log("[console:error]", m.text());
  165 |     });
  166 |     page.on("request", (req) => {
  167 |       if (req.method() !== "GET") console.log("[request]", req.method(), req.url());
  168 |     });
  169 |     page.on("response", (res) => {
  170 |       if (res.status() >= 400) console.log("[response]", res.status(), res.url());
  171 |     });
  172 |     page.on("response", async (res) => {
  173 |       if (res.url().endsWith("/id/login") && ["POST"].includes(res.request().method())) {
  174 |         const text = await res.text().catch(() => "");
  175 |         console.log("[login-response]", text.slice(0, 900));
  176 |       }
  177 |     });
  178 | 
  179 |     // Log in through the real UI so the SSR session cookie is set.
  180 |     await page.goto("/id/login");
  181 |     await page.fill('input[name="email"]', email);
  182 |     await page.fill('input[name="password"]', password);
  183 |     await page.click('button[type="submit"]');
  184 |     await page.waitForTimeout(1000);
  185 |     console.log("[debug] URL after login submit:", page.url());
  186 |     console.log("[debug] alert text:", await page.locator("p[class*='text']").allTextContents());
  187 |     console.log("[debug] body:", (await page.locator("body").innerText()).slice(0, 600));
  188 | 
  189 |     // Navigate to the editor for our seeded project.
  190 |     await page.goto(`/id/dashboard/${workspaceId}/editor`);
> 191 |     await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();
      |                                                                 ^ Error: expect(locator).toBeVisible() failed
  192 | 
  193 |     // Click Publish: data is complete (name/photo/project), so the subdomain
  194 |     // dialog opens instead of the readiness modal.
  195 |     await page.getByRole("button", { name: "Publish" }).click();
  196 |     const dialog = page.getByText("Publish Website");
  197 |     await expect(dialog).toBeVisible();
  198 | 
  199 |     const input = page.locator('input[placeholder="namamu"]');
  200 |     await expect(input).toBeVisible();
  201 | 
  202 |     // Sanitization: uppercase + invalid characters are stripped client-side.
  203 |     await input.fill("My Site !");
  204 |     await expect(input).toHaveValue("mysite");
  205 | 
  206 |     // Live URL preview updates.
  207 |     await expect(page.getByText(`sites/mysite`)).toBeVisible();
  208 | 
  209 |     // No subscription -> server returns requiresSubscription -> CTA shows.
  210 |     await page.getByRole("button", { name: "Publish" }).last().click();
  211 |     await expect(page.getByText("Berlangganan untuk publish website kamu.")).toBeVisible({
  212 |       timeout: 15000,
  213 |     });
  214 | 
  215 |     // Subdomain empty disables the publish button.
  216 |     await input.fill("");
  217 |     await expect(page.getByRole("button", { name: "Publish" }).last()).toBeDisabled();
  218 |   });
  219 | });
```