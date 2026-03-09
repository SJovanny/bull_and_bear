import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { buildBreakdown, fetchClosedTrades, withBreakdownFilters } from "@/lib/stats";

export async function GET(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = withBreakdownFilters(new URL(request.url).searchParams);
    const closedTrades = await fetchClosedTrades(filters);

    return NextResponse.json(buildBreakdown(filters, closedTrades));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load breakdown" },
      { status: 400 },
    );
  }
}
