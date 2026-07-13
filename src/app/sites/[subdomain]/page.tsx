export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  // ponytail: placeholder until publish-001 wires this up to portfolio_data +
  // template renderer (PRD 7.4, 9.3, 9.4).
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Site &quot;{subdomain}&quot; not published yet.</p>
    </div>
  );
}
