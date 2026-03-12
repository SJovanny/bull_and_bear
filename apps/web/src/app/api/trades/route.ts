import { TradeOutcome, TradeSide, TradeStatus } from "@prisma/client";

import { safeErrorResponse, verifyAccountOwnership, withAuth } from "@/lib/api";
import { tradeCreateSchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";
import { normalizeStoredTradeSymbol } from "@/lib/symbol-normalization";
import { computeTradeOutcome, defaultContractMultiplier } from "@/lib/trade-calc";

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const date = searchParams.get("date");

  if (accountId) {
    const account = await verifyAccountOwnership(accountId, user.id);
    if (!account) {
      return safeErrorResponse("Account not found", 404);
    }
  }

  let openedAtFilter: { gte: Date; lt: Date } | undefined;
  if (date) {
    const from = new Date(`${date}T00:00:00.000Z`);
    const to = new Date(from);
    to.setUTCDate(from.getUTCDate() + 1);
    if (!Number.isNaN(from.getTime())) {
      openedAtFilter = { gte: from, lt: to };
    }
  }

  const trades = await prisma.trade.findMany({
    where: {
      userId: user.id,
      ...(accountId ? { accountId } : {}),
      ...(openedAtFilter ? { openedAt: openedAtFilter } : {}),
    },
    orderBy: { openedAt: "desc" },
    take: 1000,
  });

  return Response.json({ trades });
});

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const parsedBody = tradeCreateSchema.safeParse(body);

  if (!parsedBody.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const {
    accountId,
    symbol,
    side,
    status,
    assetClass,
    openedAt,
    closedAt,
    quantity,
    entryPrice,
    initialStopLoss,
    initialTakeProfit,
    exitPrice,
    fees,
    netPnl,
    contractMultiplier,
    setupName,
    entryTimeframe,
    higherTimeframeBias,
    strategyTag,
    confluences,
    emotionalState,
    executionRating,
    planFollowed,
    entryReason,
    exitReason,
    lessonLearned,
    chartScreenshots,
    notes,
    riskAmount,
  } = parsedBody.data;

  const normalizedSymbol = normalizeStoredTradeSymbol(symbol, assetClass);

  const parsedContractMultiplier =
    contractMultiplier ?? defaultContractMultiplier(assetClass, normalizedSymbol);

  const computedTradeOutcome =
    netPnl != null ? (computeTradeOutcome(netPnl) as TradeOutcome) : null;

  if (status === "CLOSED" && exitPrice == null) {
    return safeErrorResponse("exitPrice is required when status is CLOSED", 400);
  }

  if (status === "OPEN" && exitPrice != null) {
    return safeErrorResponse("status must be CLOSED when exitPrice is provided", 400);
  }

  if (closedAt && closedAt < openedAt) {
    return safeErrorResponse("closedAt must be greater than or equal to openedAt", 400);
  }

  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const trade = await prisma.trade.create({
    data: {
      userId: user.id,
      accountId,
      assetClass: assetClass as never,
      symbol: normalizedSymbol,
      setupName,
      entryTimeframe,
      higherTimeframeBias,
      side: side as TradeSide,
      quantity,
      entryPrice,
      initialStopLoss,
      initialTakeProfit,
      exitPrice,
      fees,
      contractMultiplier: parsedContractMultiplier,
      openedAt,
      closedAt,
      status: status as TradeStatus,
      tradeOutcome: computedTradeOutcome,
      strategyTag,
      entryReason,
      exitReason,
      emotionalState,
      executionRating,
      lessonLearned,
      chartScreenshots: chartScreenshots ?? undefined,
      confluences: confluences && confluences.length > 0 ? confluences : undefined,
      planFollowed,
      notes,
      netPnl,
      riskAmount,
    },
  });

  return Response.json({ trade }, { status: 201 });
});
