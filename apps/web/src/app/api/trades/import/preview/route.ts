import { TradeOutcome, TradeSide, TradeStatus } from "@prisma/client";

import { safeErrorResponse, verifyAccountOwnership, withAuth } from "@/lib/api";
import { tradeImportPreviewSchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";
import { computeTradeOutcome } from "@/lib/trade-calc";
import { parseImportedTrades } from "@/lib/trade-import";

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const parsedBody = tradeImportPreviewSchema.safeParse(body);

  if (!parsedBody.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const { accountId, source, fileContent } = parsedBody.data;
  const account = await verifyAccountOwnership(accountId, user.id);

  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const preview = parseImportedTrades(fileContent, source);
  const rows = preview.rows;

  const sourceTradeIds = rows.map((row) => row.importSourceTradeId).filter((value): value is string => Boolean(value));
  const fingerprints = rows.map((row) => row.importFingerprint);

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

  const enrichedRows = rows.map((row) => {
    let duplicateReason = row.duplicateReason;

    if (!duplicateReason && row.importSourceTradeId && existingSourceIds.has(row.importSourceTradeId)) {
      duplicateReason = "source_trade_id";
    }

    if (!duplicateReason && existingFingerprints.has(row.importFingerprint)) {
      duplicateReason = "fingerprint";
    }

    return {
      ...row,
      duplicateReason,
      tradeOutcome: computeTradeOutcome(row.netPnl) as TradeOutcome,
      side: row.side as TradeSide,
      status: row.status as TradeStatus,
    };
  });

  const summary = {
    totalRows: enrichedRows.length,
    readyToImport: enrichedRows.filter((row) => !row.duplicateReason).length,
    duplicates: enrichedRows.filter((row) => Boolean(row.duplicateReason)).length,
    errors: preview.errors.length,
  };

  return Response.json({
    detectedSource: preview.detectedSource,
    rows: enrichedRows,
    errors: preview.errors,
    summary,
  });
});
