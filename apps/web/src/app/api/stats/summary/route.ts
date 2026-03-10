import { withAuth, verifyAccountOwnership, safeErrorResponse } from "@/lib/api";
import { buildSummary, fetchActivityTrades, fetchClosedTrades, resolveStatsPeriod } from "@/lib/stats";

export const GET = withAuth(async (request, { user }) => {
  const filters = resolveStatsPeriod(new URL(request.url).searchParams, user.id);

  const account = await verifyAccountOwnership(filters.accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const [activityTrades, closedTrades] = await Promise.all([
    fetchActivityTrades(filters),
    fetchClosedTrades(filters),
  ]);

  return Response.json(buildSummary(filters, activityTrades, closedTrades));
});
