import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

// GET /api/journals?accountId=xxx
// Returns all DailyJournal entries for the given account, ordered newest first.
export async function GET(request: Request) {
  try {
    const user = await getCurrentAppUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    // Verify the account belongs to this user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id, isArchived: false },
    });

    if (!account) {
      return NextResponse.json({ error: "Unauthorized account" }, { status: 401 });
    }

    const journals = await prisma.dailyJournal.findMany({
      where: { accountId, userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ journals });
  } catch (error) {
    console.error("Error fetching journals list:", error);
    return NextResponse.json(
      { error: "Failed to fetch journals", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
