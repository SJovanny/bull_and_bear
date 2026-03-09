import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { userId: appUser.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    user: appUser,
    accounts,
  });
}
