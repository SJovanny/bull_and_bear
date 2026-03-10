import { withAuth, verifyAccountOwnership, safeErrorResponse } from "@/lib/api";
import { buildBreakdown, fetchClosedTrades, withBreakdownFilters } from "@/lib/stats";

export const GET = withAuth(async (request, { user }) => {
  const filters = withBreakdownFilters(new URL(request.url).searchParams);

  const account = await verifyAccountOwnership(filters.accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const closedTrades = await fetchClosedTrades(filters);
  return Response.json(buildBreakdown(filters, closedTrades));
});
