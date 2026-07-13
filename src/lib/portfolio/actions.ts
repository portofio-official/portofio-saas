"use server";

import { getCurrentUserEmail } from "@/lib/auth/session";
import { savePortfolioData } from "@/lib/portfolio/store";
import type { PortfolioData } from "@/lib/portfolio/types";

export async function savePortfolioDataAction(
  data: PortfolioData,
): Promise<{ ok: boolean }> {
  const email = await getCurrentUserEmail();
  if (!email) return { ok: false };

  await savePortfolioData(email, data);
  return { ok: true };
}
