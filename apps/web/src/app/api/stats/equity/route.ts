import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { buildEquity, fetchClosedTrades, withEquityFilters } from "@/lib/stats";

export async function GET(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = withEquityFilters(new URL(request.url).searchParams);
    const closedTrades = await fetchClosedTrades(filters);

    return NextResponse.json(buildEquity(filters, closedTrades));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load equity" },
      { status: 400 },
    );
  }
}
