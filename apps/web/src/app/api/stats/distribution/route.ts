import { withAuth, verifyAccountOwnership, safeErrorResponse } from "@/lib/api";
import { buildDistribution, fetchClosedTrades, withDistributionFilters } from "@/lib/stats";

export const GET = withAuth(async (request, { user }) => {
  const filters = withDistributionFilters(new URL(request.url).searchParams);

  const account = await verifyAccountOwnership(filters.accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const closedTrades = await fetchClosedTrades(filters);
  return Response.json(buildDistribution(filters, closedTrades));
});
