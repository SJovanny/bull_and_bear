import { safeErrorResponse, verifyAccountOwnership, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return safeErrorResponse("accountId is required", 400);
  }

  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const trades = await prisma.trade.findMany({
    where: { accountId, userId: user.id },
    orderBy: { openedAt: "desc" },
  });

  const headers = [
    "Symbol",
    "Side",
    "Asset Class",
    "Quantity",
    "Entry Price",
    "Exit Price",
    "Net PnL",
    "Fees",
    "Status",
    "Opened At",
    "Closed At",
    "Setup",
    "Entry Timeframe",
    "HTF Bias",
    "Strategy Tag",
    "Emotional State",
    "Execution Rating",
    "Plan Followed",
    "Notes",
  ];

  const rows = trades.map((trade) =>
    [
      escapeCsv(trade.symbol),
      escapeCsv(trade.side),
      escapeCsv(trade.assetClass),
      escapeCsv(trade.quantity.toString()),
      escapeCsv(trade.entryPrice.toString()),
      escapeCsv(trade.exitPrice?.toString() ?? null),
      escapeCsv(trade.netPnl?.toString() ?? null),
      escapeCsv(trade.fees.toString()),
      escapeCsv(trade.status),
      escapeCsv(trade.openedAt?.toISOString() ?? null),
      escapeCsv(trade.closedAt?.toISOString() ?? null),
      escapeCsv(trade.setupName),
      escapeCsv(trade.entryTimeframe),
      escapeCsv(trade.higherTimeframeBias),
      escapeCsv(trade.strategyTag),
      escapeCsv(trade.emotionalState),
      escapeCsv(trade.executionRating),
      escapeCsv(trade.planFollowed),
      escapeCsv(trade.notes),
    ].join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="trades-export.csv"',
    },
  });
});
