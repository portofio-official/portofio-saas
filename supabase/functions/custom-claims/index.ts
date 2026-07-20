/**
 * Supabase Edge Function: custom-claims
 * ======================================
 * Hook "Custom Access Token" — dijalankan Supabase Auth setiap kali
 * JWT baru di-generate (login, refresh token).
 *
 * Fungsi ini menginjeksi `role` dari tabel `profiles` ke dalam
 * `app_metadata` JWT, sehingga RLS policies bisa baca role tanpa
 * query DB tambahan:
 *
 *   auth.jwt() -> 'app_metadata' ->> 'role'  →  'user' | 'designer' | 'admin'
 *
 * Setup di Supabase Dashboard:
 *   Authentication → Hooks → Custom Access Token Hook
 *   → pilih Edge Function ini
 *
 * Docs: https://supabase.com/docs/guides/auth/auth-hooks#custom-access-token-hook
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

interface WebhookPayload {
  type: "CustomAccessToken";
  event: {
    session_id: string;
    user: {
      id: string;
      email: string;
      app_metadata: Record<string, unknown>;
      user_metadata: Record<string, unknown>;
    };
    claims: Record<string, unknown>;
  };
}

Deno.serve(async (req: Request) => {
  // Validasi bahwa request berasal dari Supabase (bukan publik)
  const authHeader = req.headers.get("Authorization");
  const hookSecret = Deno.env.get("HOOK_SECRET");

  if (hookSecret && authHeader !== `Bearer ${hookSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload: WebhookPayload = await req.json();
  const userId = payload.event.user.id;

  // Buat Supabase client dengan service_role untuk baca profiles tanpa RLS
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Ambil role dari tabel profiles
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    // Kalau profil belum ada (race condition saat signup), default ke 'user'
    console.warn(`[custom-claims] profile not found for ${userId}: ${error.message}`);
  }

  const role = profile?.role ?? "user";

  // Inject role ke app_metadata — ini yang dibaca RLS policies
  const claims = {
    ...payload.event.claims,
    app_metadata: {
      ...payload.event.claims.app_metadata,
      role,
    },
  };

  return new Response(JSON.stringify({ claims }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
