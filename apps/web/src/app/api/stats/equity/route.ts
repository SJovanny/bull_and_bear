import { withAuth, verifyAccountOwnership, safeErrorResponse } from "@/lib/api";
import { buildEquity, fetchClosedTrades, toNumber, withEquityFilters } from "@/lib/stats";

export const GET = withAuth(async (request, { user }) => {
  const filters = withEquityFilters(new URL(request.url).searchParams, user.id);

  const account = await verifyAccountOwnership(filters.accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const initialBalance = account.initialBalance !== null ? toNumber(account.initialBalance) : null;

  const closedTrades = await fetchClosedTrades(filters);
  return Response.json(buildEquity(filters, closedTrades, initialBalance));
});
