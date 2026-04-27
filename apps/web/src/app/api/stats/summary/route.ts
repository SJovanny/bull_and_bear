import { withAuth, verifyAccountOwnership, safeErrorResponse } from "@/lib/api";
import { buildSummary, fetchActivityTrades, fetchClosedTrades, resolveStatsPeriod, toNumber } from "@/lib/stats";

export const GET = withAuth(async (request, { user }) => {
  const filters = resolveStatsPeriod(new URL(request.url).searchParams, user.id);

  const account = await verifyAccountOwnership(filters.accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const initialBalance = account.initialBalance !== null ? toNumber(account.initialBalance) : null;

  const needsAllTime = filters.period !== "ALL";

  const [activityTrades, closedTrades, allTimeClosedTrades] = await Promise.all([
    fetchActivityTrades(filters),
    fetchClosedTrades(filters),
    needsAllTime
      ? fetchClosedTrades({ ...filters, period: "ALL", from: null, to: null })
      : Promise.resolve(null),
  ]);

  const allTimeNetPnl = needsAllTime
    ? allTimeClosedTrades!.reduce((sum, t) => sum + Number(t.netPnl), 0)
    : undefined;

  return Response.json(buildSummary(filters, activityTrades, closedTrades, initialBalance, allTimeNetPnl));
});
