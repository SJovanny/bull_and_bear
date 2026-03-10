import { withAuth, verifyAccountOwnership, safeErrorResponse } from "@/lib/api";
import { buildTimeAnalysis, fetchClosedTrades, resolveStatsPeriod } from "@/lib/stats";

export const GET = withAuth(async (request, { user }) => {
  const filters = resolveStatsPeriod(new URL(request.url).searchParams, user.id);

  const account = await verifyAccountOwnership(filters.accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const closedTrades = await fetchClosedTrades(filters);
  return Response.json(buildTimeAnalysis(filters, closedTrades));
});
