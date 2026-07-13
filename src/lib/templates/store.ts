import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/templates/types";

// ponytail: one JSON file per user on local disk, standing in for the
// `template_id` column on the real `sites` table (PRD 9.4) until setup-001
// has a real Supabase project. Replace with a Supabase read/write keyed by
// auth user id, same as src/lib/portfolio/store.ts.
const STORE_DIR = path.join(process.cwd(), ".data", "template-selection");
const DEFAULT_TEMPLATE_ID: TemplateId = "minimal";

function fileForEmail(email: string): string {
  const hash = createHash("sha256").update(email).digest("hex");
  return path.join(STORE_DIR, `${hash}.json`);
}

export async function getSelectedTemplateId(email: string): Promise<TemplateId> {
  try {
    const raw = await readFile(fileForEmail(email), "utf-8");
    const parsed = JSON.parse(raw);
    return TEMPLATE_IDS.includes(parsed.templateId) ? parsed.templateId : DEFAULT_TEMPLATE_ID;
  } catch {
    return DEFAULT_TEMPLATE_ID;
  }
}

export async function saveSelectedTemplateId(email: string, templateId: TemplateId): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(fileForEmail(email), JSON.stringify({ templateId }, null, 2), "utf-8");
}
