import { TradeOutcome, TradeSide, TradeStatus } from "@prisma/client";

import { safeErrorResponse, withAuth } from "@/lib/api";
import { tradeUpdateSchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";
import { computeNetPnl, computeTradeOutcome, defaultContractMultiplier } from "@/lib/trade-calc";

export const GET = withAuth(async (_request, { user, params }) => {
  const { id } = params;

  const trade = await prisma.trade.findFirst({
    where: { id, userId: user.id },
  });

  if (!trade) {
    return safeErrorResponse("Trade not found", 404);
  }

  return Response.json({ trade });
});

export const PATCH = withAuth(async (request, { user, params }) => {
  const { id } = params;
  const body = await request.json();
  const parsedBody = tradeUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const existing = await prisma.trade.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      side: true,
      status: true,
      openedAt: true,
      closedAt: true,
      entryPrice: true,
      exitPrice: true,
      quantity: true,
      fees: true,
      contractMultiplier: true,
      symbol: true,
      assetClass: true,
    },
  });

  if (!existing) {
    return safeErrorResponse("Trade not found", 404);
  }

  const payload = parsedBody.data;
  const updateData: Record<string, unknown> = {};

  if (payload.symbol !== undefined) updateData.symbol = payload.symbol;
  if (payload.side !== undefined) updateData.side = payload.side;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.assetClass !== undefined) updateData.assetClass = payload.assetClass;
  if (payload.quantity !== undefined) updateData.quantity = payload.quantity;
  if (payload.entryPrice !== undefined) updateData.entryPrice = payload.entryPrice;
  if (payload.initialStopLoss !== undefined) updateData.initialStopLoss = payload.initialStopLoss;
  if (payload.initialTakeProfit !== undefined)
    updateData.initialTakeProfit = payload.initialTakeProfit;
  if (payload.exitPrice !== undefined) updateData.exitPrice = payload.exitPrice;
  if (payload.fees !== undefined) updateData.fees = payload.fees;
  if (payload.riskAmount !== undefined) updateData.riskAmount = payload.riskAmount;
  if (payload.openedAt !== undefined) updateData.openedAt = payload.openedAt;
  if (payload.closedAt !== undefined) updateData.closedAt = payload.closedAt;
  if (payload.setupName !== undefined) updateData.setupName = payload.setupName;
  if (payload.entryTimeframe !== undefined) updateData.entryTimeframe = payload.entryTimeframe;
  if (payload.higherTimeframeBias !== undefined)
    updateData.higherTimeframeBias = payload.higherTimeframeBias;
  if (payload.strategyTag !== undefined) updateData.strategyTag = payload.strategyTag;
  if (payload.entryReason !== undefined) updateData.entryReason = payload.entryReason;
  if (payload.exitReason !== undefined) updateData.exitReason = payload.exitReason;
  if (payload.emotionalState !== undefined) updateData.emotionalState = payload.emotionalState;
  if (payload.executionRating !== undefined) updateData.executionRating = payload.executionRating;
  if (payload.lessonLearned !== undefined) updateData.lessonLearned = payload.lessonLearned;
  if (payload.chartScreenshots !== undefined) updateData.chartScreenshots = payload.chartScreenshots;
  if (payload.confluences !== undefined) {
    updateData.confluences = payload.confluences && payload.confluences.length > 0 ? payload.confluences : null;
  }
  if (payload.planFollowed !== undefined) updateData.planFollowed = payload.planFollowed;
  if (payload.notes !== undefined) updateData.notes = payload.notes;

  if (payload.contractMultiplier !== undefined) {
    const assetClass = payload.assetClass ?? existing.assetClass;
    const symbol = payload.symbol ?? existing.symbol;
    updateData.contractMultiplier =
      payload.contractMultiplier ?? defaultContractMultiplier(assetClass, symbol);
  }

  const side = (updateData.side as TradeSide | undefined) ?? existing.side;
  const status = (updateData.status as TradeStatus | undefined) ?? existing.status;
  const openedAt = (updateData.openedAt as Date | undefined) ?? existing.openedAt;
  const closedAt =
    updateData.closedAt !== undefined ? (updateData.closedAt as Date | null) : existing.closedAt;
  const entryPrice = Number((updateData.entryPrice as number | undefined) ?? existing.entryPrice);
  const quantity = Number((updateData.quantity as number | undefined) ?? existing.quantity);
  const fees = Number((updateData.fees as number | undefined) ?? existing.fees);
  const contractMultiplier = Number(
    (updateData.contractMultiplier as number | undefined) ?? existing.contractMultiplier,
  );
  const exitPriceSource =
    updateData.exitPrice !== undefined
      ? (updateData.exitPrice as number | null)
      : existing.exitPrice != null
        ? Number(existing.exitPrice)
        : null;

  if (status === "CLOSED" && exitPriceSource == null) {
    return safeErrorResponse("exitPrice is required when status is CLOSED", 400);
  }

  if (status === "OPEN" && exitPriceSource != null) {
    return safeErrorResponse("status must be CLOSED when exitPrice is provided", 400);
  }

  if (closedAt && closedAt < openedAt) {
    return safeErrorResponse("closedAt must be greater than or equal to openedAt", 400);
  }

  if (exitPriceSource != null && Number.isFinite(Number(exitPriceSource))) {
    const netPnl = computeNetPnl({
      side,
      entryPrice,
      exitPrice: Number(exitPriceSource),
      quantity,
      fees,
      contractMultiplier,
    });
    updateData.netPnl = netPnl;
    updateData.tradeOutcome = computeTradeOutcome(netPnl) as TradeOutcome;
  } else {
    updateData.netPnl = null;
    updateData.tradeOutcome = null;
  }

  const trade = await prisma.trade.update({
    where: { id },
    data: updateData,
  });

  return Response.json({ trade });
});

export const DELETE = withAuth(async (_request, { user, params }) => {
  const { id } = params;

  const existing = await prisma.trade.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return safeErrorResponse("Trade not found", 404);
  }

  await prisma.trade.delete({ where: { id } });
  return new Response(null, { status: 204 });
});
