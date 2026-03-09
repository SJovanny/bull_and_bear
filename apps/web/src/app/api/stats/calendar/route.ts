import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import {
  buildCalendar,
  calendarRange,
  fetchActivityTrades,
  fetchCalendarJournalDates,
  withCalendarFilters,
} from "@/lib/stats";

export async function GET(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = withCalendarFilters(new URL(request.url).searchParams);
    const { start, end } = calendarRange(filters.month ?? "");
    const scopedFilters = { ...filters, from: start, to: end };
    const [activityTrades, journalDates] = await Promise.all([
      fetchActivityTrades(scopedFilters),
      fetchCalendarJournalDates(filters.accountId, start, end),
    ]);

    return NextResponse.json(buildCalendar(scopedFilters, filters.month ?? "", activityTrades, journalDates));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load calendar" },
      { status: 400 },
    );
  }
}
