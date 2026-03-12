import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type PnlRow = { accountId: string; totalPnl: unknown };

export const GET = withAuth(async (_request, { user }) => {
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    select: { id: true, initialBalance: true },
  });

  if (accounts.length === 0) {
    return Response.json({ balances: [] });
  }

  const accountIds = accounts.map((a) => a.id);

  const rows: PnlRow[] = await prisma.$queryRaw`
    SELECT "accountId", COALESCE(SUM("netPnl"), 0) AS "totalPnl"
    FROM "Trade"
    WHERE "accountId" = ANY(${accountIds})
      AND "userId" = ${user.id}
      AND "status" = 'CLOSED'
    GROUP BY "accountId"
  `;

  const pnlMap = new Map(rows.map((r) => [r.accountId, Number(r.totalPnl) || 0]));

  const balances = accounts.map((account) => {
    const totalPnl = pnlMap.get(account.id) ?? 0;
    const initialBalance = account.initialBalance !== null ? Number(account.initialBalance) : null;
    const hasBalance = initialBalance !== null && initialBalance > 0;

    return {
      accountId: account.id,
      initialBalance,
      totalPnl,
      currentBalance: hasBalance ? initialBalance + totalPnl : null,
      returnPercent: hasBalance ? (totalPnl / initialBalance) * 100 : null,
    };
  });

  return Response.json({ balances });
});
