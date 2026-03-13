import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { utils, write } from "xlsx";

import { parseImportedTrades } from "./trade-import";

describe("parseImportedTrades", () => {
  it("parses cTrader CSV rows and flags same-file duplicates", () => {
    const csv = [
      "ID,Symbol,Opening direction,Opening time,Closing time,Entry price,Closing price,Closing quantity,Commissions,Swap,Net (USD),Comment",
      "1001,EURUSD,Buy,2026-03-10 09:00:00,2026-03-10 10:00:00,1.1000,1.1020,1,-2.5,0,197.5,London session",
      "1001,EURUSD,Buy,2026-03-10 09:00:00,2026-03-10 10:00:00,1.1000,1.1020,1,-2.5,0,197.5,Duplicate",
    ].join("\n");

    const preview = parseImportedTrades(csv, "CTRADER");

    expect(preview.detectedSource).toBe("CTRADER");
    expect(preview.errors).toEqual([]);
    expect(preview.rows).toHaveLength(2);
    expect(preview.rows[0]).toMatchObject({
      symbol: "EURUSD",
      side: "LONG",
      status: "CLOSED",
      duplicateReason: null,
    });
    expect(preview.rows[1]?.duplicateReason).toBe("same_file");
  });

  it("rejects MetaTrader imports that are not XLSX files", () => {
    const preview = parseImportedTrades("<table></table>", "METATRADER", "history.html");

    expect(preview.detectedSource).toBe(null);
    expect(preview.rows).toEqual([]);
    expect(preview.errors).toEqual([{ rowNumber: 1, message: "MetaTrader imports require an XLSX file" }]);
  });

  it("parses MetaTrader XLSX history exported from account history", () => {
    const fileName = "ReportHistory-5977138.xlsx";
    const xlsx = readFileSync(join(process.cwd(), fileName)).toString("base64");

    const preview = parseImportedTrades(xlsx, "METATRADER", fileName);

    expect(preview.detectedSource).toBe("METATRADER");
    expect(preview.errors).toEqual([]);
    expect(preview.rows).toHaveLength(4);
    expect(preview.rows[0]).toMatchObject({
      importSourceTradeId: "5574605112",
      symbol: "BTCUSD",
      side: "LONG",
      quantity: 0.01,
      entryPrice: 63335.841,
      exitPrice: 70149.037,
      fees: 5.26,
      netPnl: 59.11,
      duplicateReason: null,
    });
    expect(preview.rows[3]).toMatchObject({
      importSourceTradeId: "5578195765",
      symbol: "EURUSD",
      side: "SHORT",
      netPnl: -95.57,
    });
  });

  it("parses MetaTrader XLSX closed positions", () => {
    const workbook = utils.book_new();
    const sheet = utils.aoa_to_sheet([
      ["Rapport d'historique de trading"],
      ["Positions"],
      ["Heure", "Position", "Symbole", "Type", "Volume", "Prix", "S / L", "T / P", "Heure", "Prix", "Commission", "Echange", "Profit", "Commentaire"],
      ["2026.03.10 09:00:00", "2001", "EURUSD", "buy", "1.00", "1.1000", "", "", "2026.03.10 09:30:00", "1.1010", "-2.00", "0.00", "98.00", "scalp"],
      ["2026.03.10 09:00:00", "2001", "EURUSD", "buy", "1.00", "1.1000", "", "", "2026.03.10 09:30:00", "1.1010", "-2.00", "0.00", "98.00", "duplicate"],
      ["Ordres"],
    ]);
    utils.book_append_sheet(workbook, sheet, "Sheet1");

    const xlsx_b64 = write(workbook, { type: "base64", bookType: "xlsx" });
    const preview = parseImportedTrades(xlsx_b64, "METATRADER", "history.xlsx");

    expect(preview.detectedSource).toBe("METATRADER");
    expect(preview.errors).toEqual([]);
    expect(preview.rows).toHaveLength(2);
    expect(preview.rows[0]).toMatchObject({
      importSourceTradeId: "2001",
      symbol: "EURUSD",
      side: "LONG",
      entryPrice: 1.1,
      exitPrice: 1.101,
      quantity: 1,
      netPnl: 98,
      duplicateReason: null,
    });
    expect(preview.rows[1]?.duplicateReason).toBe("same_file");
  });

  it("parses cTrader CSV without Opening time column and with DD/MM date format + Lots suffix", () => {
    const csv = [
      '"Symbol","Opening direction","Closing time (UTC+0)","Entry price","Closing price","Closing Quantity","Net €","Balance €"',
      '"BTCUSD","Buy","02/03/2026 14:47:44.584","65377.26","66783.49","0.09 Lots","104.73","10 104.73"',
      '"EURUSD","Buy","06/03/2026 11:43:59.950","1.15810","1.15643","0.40 Lots","-59.48","10 144.80"',
      '"BTCUSD","Sell","10/03/2026 15:00:12.370","69509.75","71522.20","0.03 Lots","-53.01","10 095.25"',
    ].join("\n");

    const preview = parseImportedTrades(csv, "CTRADER");

    expect(preview.detectedSource).toBe("CTRADER");
    expect(preview.errors).toEqual([]);
    expect(preview.rows).toHaveLength(3);

    // First row: BTCUSD Buy
    expect(preview.rows[0]).toMatchObject({
      symbol: "BTCUSD",
      side: "LONG",
      entryPrice: 65377.26,
      exitPrice: 66783.49,
      quantity: 0.09,
      status: "CLOSED",
      duplicateReason: null,
    });
    // openedAt should fall back to closedAt since no Opening time column
    expect(preview.rows[0]!.openedAt.toISOString()).toBe(preview.rows[0]!.closedAt.toISOString());
    // Closing time parsed as DD/MM/YYYY: 02/03/2026 → March 2, 2026
    expect(preview.rows[0]!.closedAt.getUTCFullYear()).toBe(2026);
    expect(preview.rows[0]!.closedAt.getUTCMonth()).toBe(2); // March (0-indexed)
    expect(preview.rows[0]!.closedAt.getUTCDate()).toBe(2);

    // Second row: EURUSD Buy (loss)
    expect(preview.rows[1]).toMatchObject({
      symbol: "EURUSD",
      side: "LONG",
      quantity: 0.4,
    });

    // Third row: BTCUSD Sell
    expect(preview.rows[2]).toMatchObject({
      symbol: "BTCUSD",
      side: "SHORT",
      entryPrice: 69509.75,
      exitPrice: 71522.20,
      quantity: 0.03,
    });
  });

  it("classifies crypto and commodities correctly instead of treating them as forex", () => {
    const csv = [
      "ID,Symbol,Opening direction,Opening time,Closing time,Entry price,Closing price,Closing quantity,Commissions,Swap,Net (USD),Comment",
      "2001,ADAUSD,Buy,2026-03-10 09:00:00,2026-03-10 10:00:00,0.80,0.90,100,-2,0,8,Cardano",
      "2002,LTCUSD,Sell,2026-03-10 11:00:00,2026-03-10 12:00:00,80,75,1,-1,0,4,LTC short",
      "2003,XAUUSD,Buy,2026-03-10 13:00:00,2026-03-10 14:00:00,2900,2910,1,-3,0,7,Gold",
      "2004,EURUSD,Buy,2026-03-10 15:00:00,2026-03-10 16:00:00,1.08,1.081,1,-2,0,98,Forex",
    ].join("\n");

    const preview = parseImportedTrades(csv, "CTRADER");

    expect(preview.errors).toEqual([]);
    expect(preview.rows[0]).toMatchObject({ symbol: "ADAUSD", assetClass: "CRYPTO" });
    expect(preview.rows[1]).toMatchObject({ symbol: "LTCUSD", assetClass: "CRYPTO" });
    expect(preview.rows[2]).toMatchObject({ symbol: "XAUUSD", assetClass: "CFD" });
    expect(preview.rows[3]).toMatchObject({ symbol: "EURUSD", assetClass: "FOREX" });
  });

  it("parses currency symbols in numeric fields", () => {
    const csv = [
      'ID,Symbol,Opening direction,Opening time (UTC+0),Closing time (UTC+0),Entry price,Closing price,Closing quantity,Commissions,Swap,Net €',
      '3001,BTCUSD,Buy,2026-03-10 09:00:00,2026-03-10 10:00:00,65000,65500,0.10 Lots,-€2,€0,€48',
    ].join("\n");

    const preview = parseImportedTrades(csv, "CTRADER");

    expect(preview.errors).toEqual([]);
    expect(preview.rows[0]).toMatchObject({
      fees: 2,
      netPnl: 48,
      quantity: 0.1,
    });
  });

  it("applies cTrader timezone from the header when parsing dates", () => {
    const csv = [
      'ID,Symbol,Opening direction,Opening time (UTC+2),Closing time (UTC+2),Entry price,Closing price,Closing quantity,Commissions,Swap,Net (USD)',
      '4001,EURUSD,Buy,2026-03-10 09:00:00,2026-03-10 10:00:00,1.1000,1.1010,1,-2,0,98',
    ].join("\n");

    const preview = parseImportedTrades(csv, "CTRADER");

    expect(preview.errors).toEqual([]);
    expect(preview.rows[0]?.openedAt.toISOString()).toBe("2026-03-10T07:00:00.000Z");
    expect(preview.rows[0]?.closedAt.toISOString()).toBe("2026-03-10T08:00:00.000Z");
  });
});
