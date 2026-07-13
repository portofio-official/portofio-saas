import { createClient } from "@/lib/supabase/server";
import { EMPTY_PORTFOLIO_DATA, type PortfolioData } from "@/lib/portfolio/types";

// One row per workspace in the real `portfolio_data` table (PRD 9.4).
// RLS (portfolio_data_owner_all, to authenticated) scopes every read/write to
// workspaces the caller owns — no manual ownership check needed here.
export async function getPortfolioData(workspaceId: string): Promise<PortfolioData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_data")
    .select("data")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) return EMPTY_PORTFOLIO_DATA;
  return { ...EMPTY_PORTFOLIO_DATA, ...(data.data as Partial<PortfolioData>) };
}

export async function savePortfolioData(workspaceId: string, data: PortfolioData): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio_data")
    .upsert({ workspace_id: workspaceId, data, updated_at: new Date().toISOString() });

  return !error;
}
