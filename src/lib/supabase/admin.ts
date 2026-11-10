import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, requireEnv } from "@/lib/env";

/** Service-role client. Bypasses RLS. Server only, never import from a client component. */
export function createAdminClient() {
  return createSupabaseClient(publicEnv.supabaseUrl(), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Curator allowlist: comma-separated emails in ADMIN_EMAILS. */
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}
