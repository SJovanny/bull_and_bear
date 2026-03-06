import { NextResponse } from "next/server";

import { syncUserFromAuth } from "@/lib/auth/sync-user";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUser = await syncUserFromAuth(data.user);
  const accounts = await prisma.account.findMany({
    where: { userId: appUser.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    user: appUser,
    accounts,
  });
}
