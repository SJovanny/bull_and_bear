import { z } from "zod";

import { safeErrorResponse, verifyAccountOwnership, withAuth } from "@/lib/api";
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
  marketConditions: z.string().max(5000).default(""),
  keyLevels: z.string().max(5000).default(""),
  strategiesFocus: z.array(z.string().max(500)).default([]),
  executionRating: z.coerce.number().int().min(0).max(5).default(0),
  mentalState: z.array(z.string().max(200)).default([]),
  mistakes: z.array(z.string().max(1000)).default([]),
  lessonsLearned: z.string().max(5000).default(""),
  notes: z.string().max(5000).default(""),
});

function parseUtcStartOfDay(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const dateStr = searchParams.get("date");

  if (!accountId || !dateStr) {
    return safeErrorResponse("accountId and date are required", 400);
  }

  const date = parseUtcStartOfDay(dateStr);
  if (!date) {
    return safeErrorResponse("Invalid date", 400);
  }

  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const journal = await prisma.dailyJournal.findUnique({
    where: {
      accountId_date: { accountId, date },
    },
  });

  return Response.json({ journal: journal || null });
});

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const parsedBody = journalBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return safeErrorResponse("Invalid request body", 400);
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

  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const date = parseUtcStartOfDay(dateStr);
  if (!date) {
    return safeErrorResponse("Invalid date", 400);
  }

  const journal = await prisma.dailyJournal.upsert({
    where: {
      accountId_date: { accountId, date },
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

  return Response.json({ journal });
});
