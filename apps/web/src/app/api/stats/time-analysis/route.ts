import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { buildTimeAnalysis, fetchClosedTrades, resolveStatsPeriod } from "@/lib/stats";

export async function GET(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = resolveStatsPeriod(new URL(request.url).searchParams);
    const closedTrades = await fetchClosedTrades(filters);

    return NextResponse.json(buildTimeAnalysis(filters, closedTrades));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load time analysis" },
      { status: 400 },
    );
  }
}
