import { withAuth, verifyAccountOwnership, safeErrorResponse } from "@/lib/api";
import {
  buildCalendar,
  calendarRange,
  fetchActivityTrades,
  fetchCalendarJournalDates,
  withCalendarFilters,
} from "@/lib/stats";

export const GET = withAuth(async (request, { user }) => {
  const filters = withCalendarFilters(new URL(request.url).searchParams);

  const account = await verifyAccountOwnership(filters.accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const { start, end } = calendarRange(filters.month ?? "");
  const scopedFilters = { ...filters, from: start, to: end };
  const [activityTrades, journalDates] = await Promise.all([
    fetchActivityTrades(scopedFilters),
    fetchCalendarJournalDates(filters.accountId, start, end),
  ]);

  return Response.json(buildCalendar(scopedFilters, filters.month ?? "", activityTrades, journalDates));
});
