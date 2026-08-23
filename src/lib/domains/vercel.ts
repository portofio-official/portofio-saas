// Thin wrapper over Vercel's Domain API (https://vercel.com/docs/rest-api/reference/endpoints/domains).
// No SDK — same "raw fetch, dev-mode fallback when unconfigured" pattern as
// src/lib/billing/midtrans.ts. Requires VERCEL_API_TOKEN + VERCEL_PROJECT_ID;
// VERCEL_TEAM_ID is only needed when the project lives under a team scope.

function vercelConfigured(): boolean {
  return Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
}

function apiUrl(path: string): string {
  const teamId = process.env.VERCEL_TEAM_ID;
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) url.searchParams.set("teamId", teamId);
  return url.toString();
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export interface VercelDomainVerification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

export interface AddDomainResult {
  ok: boolean;
  error?: string;
  /** DNS records the user must add before the domain will verify. */
  verification?: VercelDomainVerification[];
  /** Already verified at add time (rare — usually needs a DNS check pass). */
  verified?: boolean;
}

/** Adds `domain` to the Vercel project. Idempotent-ish: Vercel 409s if it's already attached elsewhere. */
export async function addDomainToVercelProject(domain: string): Promise<AddDomainResult> {
  if (!vercelConfigured()) {
    console.warn("[VercelDomains] VERCEL_API_TOKEN/VERCEL_PROJECT_ID not configured; skipping live domain add.");
    return { ok: true, verified: false, verification: [] };
  }

  const response = await fetch(apiUrl(`/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name: domain }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (body as { error?: { message?: string; code?: string } })?.error?.message
      ?? `Vercel API returned status ${response.status}`;
    console.error("[VercelDomains] addDomainToVercelProject failed:", response.status, body);
    return { ok: false, error: message };
  }

  const data = body as { verified?: boolean; verification?: VercelDomainVerification[] };
  return { ok: true, verified: data.verified === true, verification: data.verification ?? [] };
}

/** Checks whether `domain` has finished DNS verification on Vercel's side. */
export async function checkVercelDomainStatus(domain: string): Promise<{ verified: boolean; error?: string }> {
  if (!vercelConfigured()) {
    return { verified: false, error: "not_configured" };
  }

  const response = await fetch(
    apiUrl(`/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}/config`),
    { headers: authHeaders() },
  );

  if (!response.ok) {
    console.error("[VercelDomains] checkVercelDomainStatus failed:", response.status);
    return { verified: false, error: `Vercel API returned status ${response.status}` };
  }

  const data = await response.json() as { misconfigured?: boolean };
  return { verified: data.misconfigured === false };
}

/** Detaches `domain` from the Vercel project. Safe to call even if it was never added. */
export async function removeDomainFromVercelProject(domain: string): Promise<{ ok: boolean; error?: string }> {
  if (!vercelConfigured()) {
    console.warn("[VercelDomains] VERCEL_API_TOKEN/VERCEL_PROJECT_ID not configured; skipping live domain removal.");
    return { ok: true };
  }

  const response = await fetch(
    apiUrl(`/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}`),
    { method: "DELETE", headers: authHeaders() },
  );

  if (!response.ok && response.status !== 404) {
    console.error("[VercelDomains] removeDomainFromVercelProject failed:", response.status);
    return { ok: false, error: `Vercel API returned status ${response.status}` };
  }
  return { ok: true };
}
