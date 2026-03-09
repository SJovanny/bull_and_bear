import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { buildSummary, fetchActivityTrades, fetchClosedTrades, resolveStatsPeriod } from "@/lib/stats";

export async function GET(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = resolveStatsPeriod(new URL(request.url).searchParams);
    const [activityTrades, closedTrades] = await Promise.all([
      fetchActivityTrades(filters),
      fetchClosedTrades(filters),
    ]);

    return NextResponse.json(buildSummary(filters, activityTrades, closedTrades));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load summary" },
      { status: 400 },
    );
  }
}
