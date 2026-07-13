"use server";

import { savePortfolioData } from "@/lib/portfolio/store";
import type { PortfolioData } from "@/lib/portfolio/types";

export async function savePortfolioDataAction(
  workspaceId: string,
  data: PortfolioData,
): Promise<{ ok: boolean }> {
  const ok = await savePortfolioData(workspaceId, data);
  return { ok };
}
