import { TradeOutcome, TradeSide, TradeStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { computeNetPnl, computeTradeOutcome, defaultContractMultiplier } from "@/lib/trade-calc";

function parseDecimal(value: unknown, fieldName: string) {
  const parsed = Number(value);

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

export async function GET(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const date = searchParams.get("date");

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
    take: 200,
  });

  return NextResponse.json({ trades });
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const accountId = String(body.accountId ?? "");
    const symbol = String(body.symbol ?? "").trim().toUpperCase();
    const sideRaw = String(body.side ?? "").toUpperCase();
    const statusRaw = String(body.status ?? "OPEN").toUpperCase();
    const assetClassRaw = String(body.assetClass ?? "STOCK").toUpperCase();
    const openedAt = new Date(body.openedAt);

    if (!accountId || !symbol || !sideRaw || Number.isNaN(openedAt.getTime())) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    if (!Object.values(TradeSide).includes(sideRaw as TradeSide)) {
      return NextResponse.json({ error: "Invalid trade side" }, { status: 400 });
    }

    if (!Object.values(TradeStatus).includes(statusRaw as TradeStatus)) {
      return NextResponse.json({ error: "Invalid trade status" }, { status: 400 });
    }

    if (!ASSET_CLASSES.includes(assetClassRaw as (typeof ASSET_CLASSES)[number])) {
      return NextResponse.json({ error: "Invalid asset class" }, { status: 400 });
    }

    const screenshots = Array.isArray(body.chartScreenshots) ? body.chartScreenshots : [];
    const confluences = Array.isArray(body.confluences)
      ? body.confluences.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];

    const parsedQuantity = parseDecimal(body.quantity, "quantity");
    const parsedEntryPrice = parseDecimal(body.entryPrice, "entryPrice");
    const parsedFees = body.fees != null ? parseDecimal(body.fees, "fees") : 0;
    const parsedExitPrice = body.exitPrice != null ? parseDecimal(body.exitPrice, "exitPrice") : null;
    const parsedContractMultiplier =
      body.contractMultiplier != null && body.contractMultiplier !== ""
        ? parseDecimal(body.contractMultiplier, "contractMultiplier")
        : defaultContractMultiplier(assetClassRaw as (typeof ASSET_CLASSES)[number], symbol);

    const computedNetPnl =
      parsedExitPrice != null
        ? computeNetPnl({
            side: sideRaw as TradeSide,
            entryPrice: parsedEntryPrice,
            exitPrice: parsedExitPrice,
            quantity: parsedQuantity,
            fees: parsedFees,
            contractMultiplier: parsedContractMultiplier,
          })
        : null;

    const computedTradeOutcome =
      computedNetPnl != null ? (computeTradeOutcome(computedNetPnl) as TradeOutcome) : null;
    const closedAt = body.closedAt ? new Date(body.closedAt) : null;

    if (statusRaw === "CLOSED" && parsedExitPrice == null) {
      return NextResponse.json(
        { error: "exitPrice is required when status is CLOSED" },
        { status: 400 },
      );
    }

    if (statusRaw === "OPEN" && parsedExitPrice != null) {
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

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id, isArchived: false },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        accountId,
        assetClass: assetClassRaw as never,
        symbol,
        setupName: body.setupName ? String(body.setupName).trim() : null,
        entryTimeframe: body.entryTimeframe ? String(body.entryTimeframe).trim() : null,
        higherTimeframeBias: body.higherTimeframeBias
          ? String(body.higherTimeframeBias).trim()
          : null,
        side: sideRaw as TradeSide,
        quantity: parsedQuantity,
        entryPrice: parsedEntryPrice,
        initialStopLoss:
          body.initialStopLoss != null && body.initialStopLoss !== ""
            ? parseDecimal(body.initialStopLoss, "initialStopLoss")
            : null,
        initialTakeProfit:
          body.initialTakeProfit != null && body.initialTakeProfit !== ""
            ? parseDecimal(body.initialTakeProfit, "initialTakeProfit")
            : null,
        exitPrice: parsedExitPrice,
        fees: parsedFees,
        contractMultiplier: parsedContractMultiplier,
        openedAt,
        closedAt,
        status: statusRaw as TradeStatus,
        tradeOutcome: computedTradeOutcome,
        strategyTag: body.strategyTag ? String(body.strategyTag).trim() : null,
        entryReason: body.entryReason ? String(body.entryReason).trim() : null,
        exitReason: body.exitReason ? String(body.exitReason).trim() : null,
        emotionalState: body.emotionalState ? String(body.emotionalState).trim() : null,
        executionRating:
          body.executionRating != null && body.executionRating !== ""
            ? Number(body.executionRating)
            : null,
        lessonLearned: body.lessonLearned ? String(body.lessonLearned).trim() : null,
        chartScreenshots: screenshots.length > 0 ? screenshots : null,
        confluences: confluences.length > 0 ? confluences : null,
        planFollowed: parseNullableBoolean(body.planFollowed),
        notes: body.notes ? String(body.notes).trim() : null,
        netPnl: computedNetPnl,
        riskAmount: body.riskAmount != null ? parseDecimal(body.riskAmount, "riskAmount") : null,
      },
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request payload" },
      { status: 400 },
    );
  }
}
