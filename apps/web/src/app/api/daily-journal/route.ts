import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

const economicEventSchema = z.object({
  id: z.string(),
  time: z.string(),
  name: z.string(),
  forecast: z.string(),
  actual: z.string(),
  impact: z.enum(["low", "medium", "high"]),
});

const journalBodySchema = z.object({
  accountId: z.uuid(),
  date: z.string().min(1),
  economicEvents: z.array(economicEventSchema).default([]),
  marketConditions: z.string().default(""),
  keyLevels: z.string().default(""),
  strategiesFocus: z.array(z.string()).default([]),
  executionRating: z.coerce.number().int().min(0).max(5).default(0),
  mentalState: z.array(z.string()).default([]),
  mistakes: z.array(z.string()).default([]),
  lessonsLearned: z.string().default(""),
  notes: z.string().default(""),
});

function parseUtcStartOfDay(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentAppUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const dateStr = searchParams.get("date");

    if (!accountId || !dateStr) {
      return NextResponse.json(
        { error: "accountId and date are required" },
        { status: 400 }
      );
    }

    // Ensure date is start of day UTC
    const date = parseUtcStartOfDay(dateStr);

    if (!date) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id, isArchived: false },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Unauthorized account" }, { status: 401 });
    }

    const journal = await prisma.dailyJournal.findUnique({
      where: {
        accountId_date: {
          accountId,
          date,
        },
      },
    });

    return NextResponse.json({ journal: journal || null });
  } catch (error) {
    console.error("Error fetching daily journal:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily journal", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentAppUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedBody = journalBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      accountId,
      date: dateStr,
      economicEvents,
      marketConditions,
      keyLevels,
      strategiesFocus,
      executionRating,
      mentalState,
      mistakes,
      lessonsLearned,
      notes,
    } = parsedBody.data;

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id, isArchived: false },
    });

    if (!account) {
      return NextResponse.json({ error: "Unauthorized account" }, { status: 401 });
    }

    // Ensure date is start of day UTC
    const date = parseUtcStartOfDay(dateStr);

    if (!date) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const journal = await prisma.dailyJournal.upsert({
      where: {
        accountId_date: {
          accountId,
          date,
        },
      },
      update: {
        economicEvents,
        marketConditions,
        keyLevels,
        strategiesFocus,
        executionRating,
        mentalState,
        mistakes,
        lessonsLearned,
        notes,
      },
      create: {
        userId: user.id,
        accountId,
        date,
        economicEvents,
        marketConditions,
        keyLevels,
        strategiesFocus,
        executionRating,
        mentalState,
        mistakes,
        lessonsLearned,
        notes,
      },
    });

    return NextResponse.json(journal);
  } catch (error) {
    console.error("Error upserting daily journal:", error);
    return NextResponse.json(
      { error: "Failed to save daily journal", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
