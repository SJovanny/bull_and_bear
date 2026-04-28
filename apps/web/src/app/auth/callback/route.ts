import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/validation";
import { syncUserFromAuth } from "@/lib/auth/sync-user";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Create or update the Prisma User row immediately so it exists
      // before the user hits any page or API route.
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        try {
          await syncUserFromAuth(data.user);
        } catch (syncError) {
          console.error("[auth/callback] Failed to sync user to DB:", syncError);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
