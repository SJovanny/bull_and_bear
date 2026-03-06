import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";

export async function syncUserFromAuth(user: SupabaseUser) {
  if (!user.email) {
    throw new Error("Authenticated user is missing an email.");
  }

  return prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      displayName:
        user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email.split("@")[0],
    },
    create: {
      id: user.id,
      email: user.email,
      displayName:
        user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email.split("@")[0],
    },
  });
}
