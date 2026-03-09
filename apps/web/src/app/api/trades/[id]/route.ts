import { TradeOutcome, TradeSide, TradeStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { computeNetPnl, computeTradeOutcome, defaultContractMultiplier } from "@/lib/trade-calc";

function parseDecimal(value: unknown, fieldName: string) {
  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}`);
  }

  return parsed;
}

function parseNullableBoolean(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

const ASSET_CLASSES = [
  "STOCK",
  "FUTURES",
  "FOREX",
  "CRYPTO",
  "OPTIONS",
  "ETF",
  "INDEX",
  "CFD",
  "OTHER",
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const trade = await prisma.trade.findFirst({
    where: { id, userId: user.id },
  });

  if (!trade) {
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });
  }

  return NextResponse.json({ trade });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

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
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.symbol != null) {
      updateData.symbol = String(body.symbol).trim().toUpperCase();
    }
    if (body.side != null) {
      const sideRaw = String(body.side).toUpperCase();
      if (!Object.values(TradeSide).includes(sideRaw as TradeSide)) {
        return NextResponse.json({ error: "Invalid trade side" }, { status: 400 });
      }
      updateData.side = sideRaw;
    }
    if (body.status != null) {
      const statusRaw = String(body.status).toUpperCase();
      if (!Object.values(TradeStatus).includes(statusRaw as TradeStatus)) {
        return NextResponse.json({ error: "Invalid trade status" }, { status: 400 });
      }
      updateData.status = statusRaw;
    }
    if (body.assetClass != null) {
      const assetClassRaw = String(body.assetClass).toUpperCase();
      if (!ASSET_CLASSES.includes(assetClassRaw as (typeof ASSET_CLASSES)[number])) {
        return NextResponse.json({ error: "Invalid asset class" }, { status: 400 });
      }
      updateData.assetClass = assetClassRaw;
    }

    if (body.quantity != null) updateData.quantity = parseDecimal(body.quantity, "quantity");
    if (body.entryPrice != null)
      updateData.entryPrice = parseDecimal(body.entryPrice, "entryPrice");
    if (body.initialStopLoss != null)
      updateData.initialStopLoss =
        body.initialStopLoss === "" ? null : parseDecimal(body.initialStopLoss, "initialStopLoss");
    if (body.initialTakeProfit != null)
      updateData.initialTakeProfit =
        body.initialTakeProfit === ""
          ? null
          : parseDecimal(body.initialTakeProfit, "initialTakeProfit");
    if (body.exitPrice != null)
      updateData.exitPrice = body.exitPrice === "" ? null : parseDecimal(body.exitPrice, "exitPrice");
    if (body.fees != null) updateData.fees = parseDecimal(body.fees, "fees");
    if (body.contractMultiplier != null)
      updateData.contractMultiplier =
        body.contractMultiplier === ""
          ? defaultContractMultiplier(existing.assetClass, existing.symbol)
          : parseDecimal(body.contractMultiplier, "contractMultiplier");
    if (body.riskAmount != null)
      updateData.riskAmount = parseDecimal(body.riskAmount, "riskAmount");

    if (body.openedAt != null) updateData.openedAt = new Date(body.openedAt);
    if (body.closedAt != null) updateData.closedAt = new Date(body.closedAt);
    if (body.setupName != null) updateData.setupName = String(body.setupName).trim();
    if (body.entryTimeframe != null)
      updateData.entryTimeframe = String(body.entryTimeframe).trim();
    if (body.higherTimeframeBias != null)
      updateData.higherTimeframeBias = String(body.higherTimeframeBias).trim();
    if (body.strategyTag != null) updateData.strategyTag = String(body.strategyTag).trim();
    if (body.entryReason != null) updateData.entryReason = String(body.entryReason).trim();
    if (body.exitReason != null) updateData.exitReason = String(body.exitReason).trim();
    if (body.emotionalState != null)
      updateData.emotionalState = String(body.emotionalState).trim();
    if (body.executionRating != null)
      updateData.executionRating = Number(body.executionRating);
    if (body.lessonLearned != null)
      updateData.lessonLearned = String(body.lessonLearned).trim();
    if (body.chartScreenshots != null)
      updateData.chartScreenshots = Array.isArray(body.chartScreenshots)
        ? body.chartScreenshots
        : null;
    if (body.confluences != null)
      updateData.confluences = Array.isArray(body.confluences)
        ? body.confluences.map((item: unknown) => String(item).trim()).filter(Boolean)
        : null;
    if (body.planFollowed != null) updateData.planFollowed = parseNullableBoolean(body.planFollowed);
    if (body.notes != null) updateData.notes = String(body.notes).trim();

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
      return NextResponse.json(
        { error: "exitPrice is required when status is CLOSED" },
        { status: 400 },
      );
    }

    if (status === "OPEN" && exitPriceSource != null) {
      return NextResponse.json(
        { error: "status must be CLOSED when exitPrice is provided" },
        { status: 400 },
      );
    }

    if (closedAt && Number.isNaN(closedAt.getTime())) {
      return NextResponse.json({ error: "Invalid closedAt date" }, { status: 400 });
    }

    if (closedAt && closedAt < openedAt) {
      return NextResponse.json(
        { error: "closedAt must be greater than or equal to openedAt" },
        { status: 400 },
      );
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

    return NextResponse.json({ trade });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request payload" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.trade.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });
  }

  await prisma.trade.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
