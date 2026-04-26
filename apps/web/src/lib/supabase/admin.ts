import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireEnv } from "@/lib/env";

/**
 * Supabase admin client using the service-role key.
 * Use ONLY for privileged operations (e.g. deleting a user from Supabase Auth).
 * NEVER expose this on the client side.
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceRoleKey = requireEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
