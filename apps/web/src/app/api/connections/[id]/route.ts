/**
 * POST /api/connections/[id]/sync
 *
 * Triggers a manual resync for the BrokerConnection with the given id.
 *
 * Handles the full trade lifecycle:
 *   1. Fetches closed deals (since lastSyncAt) + all current open positions
 *   2. For closed deals:
 *      - If a matching OPEN trade exists in DB (same importSourceTradeId) → UPDATE it to CLOSED
 *      - If it's brand new → INSERT as CLOSED
 *      - If already CLOSED in DB → skip (dedup)
 *   3. For open positions:
 *      - If already in DB as OPEN → UPDATE entry price / quantity (partial fills)
 *      - If new → INSERT as OPEN
 *      - If already CLOSED in DB (closed before this sync) → skip
 *
 * DELETE /api/connections/[id]
 *
 * Removes a BrokerConnection (disconnects the broker account).
 */

import { Prisma, TradeOutcome, TradeSide, TradeStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { safeErrorResponse, withAuth } from "@/lib/api";
import {
  fetchDealsForAccount,
  refreshAccessToken,
  type CTraderCredentials,
} from "@/lib/ctrader-api";
import { mapDealsToTrades, mapPositionsToOpenTrades } from "@/lib/ctrader-sync";
import { prisma } from "@/lib/prisma";
import { computeTradeOutcome } from "@/lib/trade-calc";

const CTRADER_CLIENT_ID = process.env.CTRADER_CLIENT_ID ?? "";
const CTRADER_CLIENT_SECRET = process.env.CTRADER_CLIENT_SECRET ?? "";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// ─── POST ────────────────────────────────────────────────────────────────────

export const POST = withAuth(async (_request, { user, params }) => {
  const connectionId = params.id;
  if (!connectionId) {
    return safeErrorResponse("Connection ID is required", 400);
  }

  if (!CTRADER_CLIENT_ID || !CTRADER_CLIENT_SECRET) {
    return safeErrorResponse("cTrader integration is not configured", 503);
  }

  const connection = await prisma.brokerConnection.findFirst({
    where: { id: connectionId, userId: user.id },
  });

  if (!connection) {
    return safeErrorResponse("Connection not found", 404);
  }

  if (connection.syncStatus === "SYNCING") {
    return NextResponse.json({ status: "already_syncing" }, { status: 409 });
  }

  await prisma.brokerConnection.update({
    where: { id: connectionId },
    data: { syncStatus: "SYNCING", syncError: null },
  });

  try {
    const credentials: CTraderCredentials = {
      clientId: CTRADER_CLIENT_ID,
      clientSecret: CTRADER_CLIENT_SECRET,
    };

    // ── Token refresh ────────────────────────────────────────────────────
    let { accessToken, refreshToken, tokenExpiresAt } = connection;
    const nowMs = Date.now();

    if (tokenExpiresAt.getTime() - nowMs < 5 * 60 * 1000) {
      const refreshed = await refreshAccessToken(connection.refreshToken, credentials);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      tokenExpiresAt = new Date(nowMs + refreshed.expiresInSeconds * 1000);
      await prisma.brokerConnection.update({
        where: { id: connectionId },
        data: { accessToken, refreshToken, tokenExpiresAt },
      });
    }

    // ── Fetch from broker ────────────────────────────────────────────────
    const toMs = nowMs;
    const fromMs = connection.lastSyncAt
      ? connection.lastSyncAt.getTime()
      : nowMs - 2 * 365 * 24 * 60 * 60 * 1000;

    const { deals, positions, symbolMap } = await fetchDealsForAccount(
      accessToken,
      connection.ctidTraderAccountId,
      connection.isLive,
      fromMs,
      toMs,
      credentials,
    );

    const accountId = connection.accountId;

    // ── Map raw data ─────────────────────────────────────────────────────
    const { trades: closedDrafts } = mapDealsToTrades(deals, symbolMap);
    const openDrafts = mapPositionsToOpenTrades(positions, symbolMap);

    // ── Resolve existing DB trades by positionId (sourceTradeId) ─────────
    // Collect all positionIds we care about
    const allSourceIds = [
      ...closedDrafts.map((d) => d.importSourceTradeId).filter((id): id is string => id != null),
      ...openDrafts.map((d) => d.importSourceTradeId),
    ];

    const existingTrades = allSourceIds.length > 0
      ? await prisma.trade.findMany({
          where: {
            accountId,
            importSource: "CTRADER",
            importSourceTradeId: { in: allSourceIds },
          },
          select: { id: true, importSourceTradeId: true, status: true, importFingerprint: true },
        })
      : [];

    // Build lookup maps
    const existingById = new Map(
      existingTrades.map((t) => [t.importSourceTradeId, t]),
    );

    // Also check fingerprint dedup for closed drafts (catches trades imported via CSV)
    const closedFingerprints = closedDrafts.map((d) => d.importFingerprint);
    const existingByFingerprint = closedFingerprints.length > 0
      ? await prisma.trade.findMany({
          where: { accountId, importFingerprint: { in: closedFingerprints } },
          select: { importFingerprint: true, status: true },
        })
      : [];
    const existingFingerprintSet = new Set(
      existingByFingerprint.map((t) => t.importFingerprint).filter(Boolean),
    );

    // ── Process closed trades ────────────────────────────────────────────
    let imported = 0;
    let skipped = 0;
    let updatedToClose = 0;

    await prisma.$transaction(async (tx) => {
      // ── Closed deals ──────────────────────────────────────────────────
      for (const draft of closedDrafts) {
        const existing = draft.importSourceTradeId
          ? existingById.get(draft.importSourceTradeId)
          : null;

        if (existing) {
          if (existing.status === "OPEN") {
            // Position was open in DB — now closed. Update it.
            await tx.trade.update({
              where: { id: existing.id },
              data: {
                exitPrice: draft.exitPrice,
                closedAt: draft.closedAt,
                status: "CLOSED" as TradeStatus,
                tradeOutcome: computeTradeOutcome(draft.netPnl) as TradeOutcome,
                netPnl: draft.netPnl,
                fees: draft.fees,
                importFingerprint: draft.importFingerprint,
                importedAt: new Date(),
              },
            });
            updatedToClose += 1;
          } else {
            // Already CLOSED in DB → skip
            skipped += 1;
          }
          continue;
        }

        // Fingerprint dedup (e.g. already imported via CSV)
        if (existingFingerprintSet.has(draft.importFingerprint)) {
          skipped += 1;
          continue;
        }

        // Brand new closed trade → insert
        try {
          await tx.trade.create({
            data: {
              userId: user.id,
              accountId,
              importSource: draft.importSource,
              importSourceTradeId: draft.importSourceTradeId,
              importFingerprint: draft.importFingerprint,
              importedAt: new Date(),
              assetClass: draft.assetClass,
              symbol: draft.symbol,
              side: draft.side as TradeSide,
              quantity: draft.quantity,
              entryPrice: draft.entryPrice,
              exitPrice: draft.exitPrice,
              fees: draft.fees,
              contractMultiplier: draft.contractMultiplier,
              openedAt: draft.openedAt,
              closedAt: draft.closedAt,
              status: "CLOSED" as TradeStatus,
              tradeOutcome: computeTradeOutcome(draft.netPnl) as TradeOutcome,
              netPnl: draft.netPnl,
              notes: draft.notes,
            },
          });
          imported += 1;
        } catch (err) {
          if (isUniqueConstraintError(err)) {
            skipped += 1;
          } else {
            throw err;
          }
        }
      }

      // ── Open positions ────────────────────────────────────────────────
      for (const draft of openDrafts) {
        const existing = existingById.get(draft.importSourceTradeId);

        if (existing) {
          if (existing.status === "OPEN") {
            // Already open in DB — update in case entry price / qty changed
            await tx.trade.update({
              where: { id: existing.id },
              data: {
                entryPrice: draft.entryPrice,
                quantity: draft.quantity,
                fees: draft.fees,
                openedAt: draft.openedAt,
              },
            });
            // Don't count as "imported" — just a refresh
          } else {
            // Already CLOSED in DB — position closed before this sync window
            skipped += 1;
          }
          continue;
        }

        // New open position → insert
        try {
          await tx.trade.create({
            data: {
              userId: user.id,
              accountId,
              importSource: draft.importSource,
              importSourceTradeId: draft.importSourceTradeId,
              importFingerprint: draft.importFingerprint,
              importedAt: new Date(),
              assetClass: draft.assetClass,
              symbol: draft.symbol,
              side: draft.side as TradeSide,
              quantity: draft.quantity,
              entryPrice: draft.entryPrice,
              exitPrice: null,
              fees: draft.fees,
              contractMultiplier: draft.contractMultiplier,
              openedAt: draft.openedAt,
              closedAt: null,
              status: "OPEN" as TradeStatus,
              tradeOutcome: null,
              netPnl: null,
              notes: draft.notes,
            },
          });
          imported += 1;
        } catch (err) {
          if (isUniqueConstraintError(err)) {
            // Already exists — harmless race condition
          } else {
            throw err;
          }
        }
      }
    });

    await prisma.brokerConnection.update({
      where: { id: connectionId },
      data: { syncStatus: "IDLE", lastSyncAt: new Date(toMs), syncError: null },
    });

    return NextResponse.json({ imported, skipped, updatedToClose, errors: [] });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown sync error";
    await prisma.brokerConnection.update({
      where: { id: connectionId },
      data: { syncStatus: "ERROR", syncError: errorMsg },
    });
    return safeErrorResponse("Sync failed", 500, err);
  }
});

// ─── DELETE ──────────────────────────────────────────────────────────────────

export const DELETE = withAuth(async (_request, { user, params }) => {
  const connectionId = params.id;
  if (!connectionId) {
    return safeErrorResponse("Connection ID is required", 400);
  }

  const connection = await prisma.brokerConnection.findFirst({
    where: { id: connectionId, userId: user.id },
    select: { id: true },
  });

  if (!connection) {
    return safeErrorResponse("Connection not found", 404);
  }

  await prisma.brokerConnection.delete({ where: { id: connectionId } });

  return NextResponse.json({ success: true });
});
