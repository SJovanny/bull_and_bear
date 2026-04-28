import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// ─── GET /api/me/export ─ Right to portability (GDPR Art. 20) ────────────────

export const GET = withAuth(async (_request, { user }) => {
  // Fetch all user data in parallel
  const [profile, accounts, trades, journals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        broker: true,
        accountType: true,
        currency: true,
        initialBalance: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { openedAt: "desc" },
      select: {
        id: true,
        accountId: true,
        assetClass: true,
        symbol: true,
        setupName: true,
        entryTimeframe: true,
        higherTimeframeBias: true,
        side: true,
        quantity: true,
        entryPrice: true,
        initialStopLoss: true,
        initialTakeProfit: true,
        exitPrice: true,
        fees: true,
        contractMultiplier: true,
        openedAt: true,
        closedAt: true,
        status: true,
        tradeOutcome: true,
        strategyTag: true,
        entryReason: true,
        exitReason: true,
        emotionalState: true,
        executionRating: true,
        lessonLearned: true,
        confluences: true,
        planFollowed: true,
        notes: true,
        netPnl: true,
        riskAmount: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.dailyJournal.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        accountId: true,
        date: true,
        economicEvents: true,
        marketConditions: true,
        keyLevels: true,
        strategiesFocus: true,
        executionRating: true,
        mentalState: true,
        mistakes: true,
        lessonsLearned: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile,
    accounts,
    trades,
    journals,
  };

  const json = JSON.stringify(exportData, null, 2);

  return new Response(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="bull-and-bear-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}, { skipSubscriptionCheck: true });
