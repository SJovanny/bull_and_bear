import "server-only";

import { syncUserFromAuth } from "@/lib/auth/sync-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentAppUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const appUser = await syncUserFromAuth(data.user);
  return appUser;
}
