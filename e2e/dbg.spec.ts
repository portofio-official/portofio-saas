import { test } from "@playwright/test";

test("capture console on /id/login", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
  await page.goto("/id/login");
  await page.waitForTimeout(1500);
  for (const l of logs) console.log("[LOG]", l);
});