import { Prisma, TradeOutcome, TradeSide, TradeStatus } from "@prisma/client";

import { safeErrorResponse, safeParseJson, verifyAccountOwnership, withAuth } from "@/lib/api";
import { tradeImportConfirmSchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";
import { computeTradeOutcome } from "@/lib/trade-calc";
import { parseImportedTrades, type PersistableImportedTrade } from "@/lib/trade-import";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export const POST = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsedBody = tradeImportConfirmSchema.safeParse(body);

  if (!parsedBody.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const { accountId, source, fileContent, fileName } = parsedBody.data;
  const account = await verifyAccountOwnership(accountId, user.id);

  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const preview = parseImportedTrades(fileContent, source, fileName);
  const validRows: PersistableImportedTrade[] = preview.rows
    .filter((row) => !row.duplicateReason)
    .map((row) => ({
      importSource: row.importSource,
      importSourceTradeId: row.importSourceTradeId,
      importFingerprint: row.importFingerprint,
      assetClass: row.assetClass,
      symbol: row.symbol,
      side: row.side,
      quantity: row.quantity,
      entryPrice: row.entryPrice,
      exitPrice: row.exitPrice,
      fees: row.fees,
      contractMultiplier: row.contractMultiplier,
      openedAt: row.openedAt,
      closedAt: row.closedAt,
      status: row.status,
      netPnl: row.netPnl,
      notes: row.notes,
    }));

  if (validRows.length === 0) {
    return Response.json({
      imported: 0,
      skipped: preview.rows.length,
      errors: preview.errors,
    });
  }

  const sourceTradeIds = validRows
    .map((row) => row.importSourceTradeId)
    .filter((value): value is string => Boolean(value));
  const fingerprints = validRows.map((row) => row.importFingerprint);

  const [existingBySourceId, existingByFingerprint] = await Promise.all([
    sourceTradeIds.length > 0
      ? prisma.trade.findMany({
          where: {
            accountId,
            importSource: source,
            importSourceTradeId: { in: sourceTradeIds },
          },
          select: { importSourceTradeId: true },
        })
      : Promise.resolve([]),
    fingerprints.length > 0
      ? prisma.trade.findMany({
          where: {
            accountId,
            importFingerprint: { in: fingerprints },
          },
          select: { importFingerprint: true },
        })
      : Promise.resolve([]),
  ]);

  const existingSourceIds = new Set(existingBySourceId.map((trade) => trade.importSourceTradeId).filter((value): value is string => Boolean(value)));
  const existingFingerprints = new Set(existingByFingerprint.map((trade) => trade.importFingerprint).filter((value): value is string => Boolean(value)));

  let imported = 0;
  let skipped = preview.rows.length - validRows.length;

  for (const row of validRows) {
    if (row.importSourceTradeId && existingSourceIds.has(row.importSourceTradeId)) {
      skipped += 1;
      continue;
    }

    if (existingFingerprints.has(row.importFingerprint)) {
      skipped += 1;
      continue;
    }

    try {
      await prisma.trade.create({
        data: {
          userId: user.id,
          accountId,
          importSource: row.importSource,
          importSourceTradeId: row.importSourceTradeId,
          importFingerprint: row.importFingerprint,
          importedAt: new Date(),
          assetClass: row.assetClass,
          symbol: row.symbol,
          side: row.side as TradeSide,
          quantity: row.quantity,
          entryPrice: row.entryPrice,
          exitPrice: row.exitPrice,
          fees: row.fees,
          contractMultiplier: row.contractMultiplier,
          openedAt: row.openedAt,
          closedAt: row.closedAt,
          status: row.status as TradeStatus,
          tradeOutcome: computeTradeOutcome(row.netPnl) as TradeOutcome,
          netPnl: row.netPnl,
          notes: row.notes,
        },
      });
      imported += 1;
      if (row.importSourceTradeId) {
        existingSourceIds.add(row.importSourceTradeId);
      }
      existingFingerprints.add(row.importFingerprint);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        skipped += 1;
        continue;
      }

      return safeErrorResponse("Could not import trades", 500, error);
    }
  }

  return Response.json({
    imported,
    skipped,
    errors: preview.errors,
  });
});
