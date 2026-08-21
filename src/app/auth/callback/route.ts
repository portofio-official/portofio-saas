import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/utils/sanitize";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectParam = sanitizeRedirectPath(searchParams.get("redirect"), "/dashboard");
  const templateId = searchParams.get("templateId");

  let appUrl = origin;
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    appUrl = domain.includes("localhost") ? `http://${domain}` : `https://${domain}`;
  }

  const response = NextResponse.redirect(`${appUrl}${redirectParam}`);
  if (templateId) {
    response.cookies.set("preferredTemplateId", templateId, { path: "/", maxAge: 3600 });
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=confirm_failed`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
  }

  return response;
}
