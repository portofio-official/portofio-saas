import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Refreshes the Supabase auth cookie on every request so server components
// see an up-to-date session (see @supabase/ssr Next.js middleware pattern).
async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role || null;
  const pathname = request.nextUrl.pathname;

  const isProtected = pathname.includes('/admin') || pathname.includes('/designer');
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (pathname.includes('/admin') && role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (pathname.includes('/designer') && role !== 'designer' && role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

// Root domain the app itself is served on (PRD 9.7). Anything else in the
// host is treated as a published site's subdomain, e.g. nama.localhost:3000
// or nama.appku.com.
const ROOT_DOMAIN = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000"
).replace(/^https?:\/\//, "");

function extractSubdomain(host: string): string | null {
  const hostWithoutPort = host.split(":")[0];
  const rootWithoutPort = ROOT_DOMAIN.split(":")[0];

  if (hostWithoutPort === rootWithoutPort || hostWithoutPort === `www.${rootWithoutPort}`) {
    return null;
  }

  if (!hostWithoutPort.endsWith(`.${rootWithoutPort}`)) {
    return null;
  }

  return hostWithoutPort.slice(0, -(`.${rootWithoutPort}`.length));
}

export default async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subdomain = extractSubdomain(host);

  if (subdomain) {
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  const response = intlMiddleware(request);
  return refreshSupabaseSession(request, response);
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
