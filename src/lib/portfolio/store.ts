import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { EMPTY_PORTFOLIO_DATA, type PortfolioData } from "@/lib/portfolio/types";

// ponytail: one JSON file per user on local disk, standing in for a real
// `portfolio_data` table (PRD 9.4) until setup-001 has a real Supabase
// project. Replace with a Supabase read/write keyed by auth user id.
const STORE_DIR = path.join(process.cwd(), ".data", "portfolio-drafts");

function fileForEmail(email: string): string {
  const hash = createHash("sha256").update(email).digest("hex");
  return path.join(STORE_DIR, `${hash}.json`);
}

export async function getPortfolioData(email: string): Promise<PortfolioData> {
  try {
    const raw = await readFile(fileForEmail(email), "utf-8");
    return { ...EMPTY_PORTFOLIO_DATA, ...JSON.parse(raw) };
  } catch {
    return EMPTY_PORTFOLIO_DATA;
  }
}

export async function savePortfolioData(email: string, data: PortfolioData): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(fileForEmail(email), JSON.stringify(data, null, 2), "utf-8");
}
