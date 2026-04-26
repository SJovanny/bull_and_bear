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
    }),
    prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { openedAt: "desc" },
    }),
    prisma.dailyJournal.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
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
});
