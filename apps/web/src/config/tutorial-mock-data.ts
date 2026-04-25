// ============================================================================
// TUTORIAL MOCK DATA — Injected when a tutorial tour is actively running
// ============================================================================

import type {
  StatsSummary,
  StatsEquity,
  StatsCalendar,
  StatsBreakdown,
  StatsDistribution,
  StatsTimeAnalysis,
} from "@/types";

// ─── Helper: relative dates (always within current month) ──────────────────
function daysAgoInCurrentMonth(n: number): string {
  const now = new Date();
  const day = now.getDate();
  // If subtracting n would go to previous month, clamp to day 1 of current month
  const targetDay = Math.max(1, day - n);
  const d = new Date(now.getFullYear(), now.getMonth(), targetDay, 10, 30, 0);
  return d.toISOString();
}

function daysAgo(n: number): string {
  return daysAgoInCurrentMonth(n);
}

function dateKey(n: number): string {
  return daysAgo(n).slice(0, 10);
}

// ─── Trade Detail (full shape used by trades/[id]/page.tsx) ────────────────
export const mockTradeDetail = {
  id: "tutorial-mock-001",
  accountId: "tutorial-account",
  assetClass: "FUTURES",
  symbol: "NQ",
  side: "LONG" as const,
  quantity: "2",
  entryPrice: "18450.50",
  initialStopLoss: "18420.00",
  initialTakeProfit: "18520.00",
  contractMultiplier: "20",
  exitPrice: "18512.75",
  fees: "9.40",
  openedAt: daysAgo(2),
  closedAt: daysAgo(2),
  status: "CLOSED",
  tradeOutcome: "WIN" as const,
  setupName: "Break & Retest",
  entryTimeframe: "5m",
  higherTimeframeBias: "Bullish",
  strategyTag: "Momentum",
  entryReason: "Price broke above the 18450 resistance level and retested it as support with increasing volume. 5m candle closed strong above the level.",
  exitReason: "Reached 80% of the take-profit target. Momentum was slowing on the 1m chart with a bearish divergence forming on RSI.",
  emotionalState: "Focused",
  executionRating: 8,
  lessonLearned: "Good patience waiting for the retest. Could have held longer — the move continued another 20 points after exit.",
  chartScreenshots: [],
  confluences: ["Volume spike", "HTF trend alignment", "Key level break", "VWAP reclaim"],
  planFollowed: true,
  notes: "Clean setup. Entered on the 5m retest after the initial breakout. Risk was well-defined below the level.",
  netPnl: "1235.60",
  riskAmount: "610.00",
};

// ─── Trades list (slim shape used by dashboard & journal) ──────────────────
export const mockTrades = [
  {
    id: "tutorial-mock-001",
    symbol: "NQ",
    side: "LONG" as const,
    quantity: "2",
    entryPrice: "18450.50",
    exitPrice: "18512.75",
    status: "CLOSED",
    openedAt: daysAgo(2),
    closedAt: daysAgo(2),
    netPnl: "1235.60",
    riskAmount: "610.00",
  },
  {
    id: "tutorial-mock-002",
    symbol: "ES",
    side: "SHORT" as const,
    quantity: "1",
    entryPrice: "5285.00",
    exitPrice: "5271.50",
    status: "CLOSED",
    openedAt: daysAgo(3),
    closedAt: daysAgo(3),
    netPnl: "675.00",
    riskAmount: "500.00",
  },
  {
    id: "tutorial-mock-003",
    symbol: "AAPL",
    side: "LONG" as const,
    quantity: "50",
    entryPrice: "189.20",
    exitPrice: "186.80",
    status: "CLOSED",
    openedAt: daysAgo(4),
    closedAt: daysAgo(4),
    netPnl: "-120.00",
    riskAmount: "200.00",
  },
  {
    id: "tutorial-mock-004",
    symbol: "EUR/USD",
    side: "LONG" as const,
    quantity: "100000",
    entryPrice: "1.0845",
    exitPrice: "1.0872",
    status: "CLOSED",
    openedAt: daysAgo(5),
    closedAt: daysAgo(5),
    netPnl: "270.00",
    riskAmount: "150.00",
  },
  {
    id: "tutorial-mock-005",
    symbol: "NQ",
    side: "SHORT" as const,
    quantity: "1",
    entryPrice: "18380.00",
    exitPrice: null,
    status: "OPEN",
    openedAt: daysAgo(0),
    closedAt: null,
    netPnl: null,
    riskAmount: "400.00",
  },
];

// ─── Calendar trades (full shape for calendar page) ────────────────────────
export const mockCalendarTrades = [
  {
    ...mockTradeDetail,
    id: "tutorial-mock-001",
  },
  {
    id: "tutorial-mock-002",
    accountId: "tutorial-account",
    assetClass: "FUTURES" as const,
    symbol: "ES",
    side: "SHORT" as const,
    quantity: "1",
    entryPrice: "5285.00",
    initialStopLoss: "5295.00",
    initialTakeProfit: "5265.00",
    contractMultiplier: "50",
    exitPrice: "5271.50",
    fees: "4.70",
    openedAt: daysAgo(3),
    closedAt: daysAgo(3),
    status: "CLOSED" as const,
    setupName: "Order Block",
    entryTimeframe: "15m",
    higherTimeframeBias: "Bearish",
    strategyTag: "Mean Reversion",
    entryReason: "Short at the 15m order block after a bearish engulfing candle.",
    exitReason: "Target hit at the previous day low.",
    emotionalState: "Calm",
    executionRating: 9,
    lessonLearned: "Textbook execution. Patience paid off.",
    chartScreenshots: [] as string[],
    confluences: ["Order block", "Bearish engulfing", "Previous day low"],
    planFollowed: true,
    notes: null,
    netPnl: "675.00",
    riskAmount: "500.00",
  },
  {
    id: "tutorial-mock-003",
    accountId: "tutorial-account",
    assetClass: "STOCK" as const,
    symbol: "AAPL",
    side: "LONG" as const,
    quantity: "50",
    entryPrice: "189.20",
    initialStopLoss: "185.00",
    initialTakeProfit: "195.00",
    contractMultiplier: "1",
    exitPrice: "186.80",
    fees: "1.00",
    openedAt: daysAgo(4),
    closedAt: daysAgo(4),
    status: "CLOSED" as const,
    setupName: "Gap & Go",
    entryTimeframe: "5m",
    higherTimeframeBias: "Neutral",
    strategyTag: "Momentum",
    entryReason: "Gapped up on earnings, entered on the 5m pullback.",
    exitReason: "Stopped out — gap filled.",
    emotionalState: "Frustrated",
    executionRating: 5,
    lessonLearned: "Avoid gap plays when the broader market is weak. Should have waited for confirmation.",
    chartScreenshots: [] as string[],
    confluences: ["Earnings gap", "Volume"],
    planFollowed: false,
    notes: "Deviated from the plan by entering too early.",
    netPnl: "-120.00",
    riskAmount: "200.00",
  },
];

// ─── Journal Entries ───────────────────────────────────────────────────────
export const mockJournalEntries = [
  {
    id: "tutorial-journal-001",
    date: dateKey(2),
    economicEvents: "FOMC minutes released at 2pm EST. Market volatile around the release.",
    marketConditions: "Trending day. NQ broke out of a 3-day range with strong volume. ES followed. Internals were green all morning.",
    keyLevels: "NQ: 18400 support, 18500 resistance. ES: 5280 support, 5300 resistance.",
    strategiesFocus: ["Break & Retest", "Momentum"],
    executionRating: 8,
    mentalState: ["Focused", "Patient"],
    mistakes: [],
    lessonsLearned: "Great day overall. Waited for confirmation before entering. Need to work on holding winners longer.",
    notes: "2 trades today — 1 winner on NQ, 1 winner on ES. Both were clean setups with good R:R.",
  },
  {
    id: "tutorial-journal-002",
    date: dateKey(4),
    economicEvents: "CPI data release. Higher than expected.",
    marketConditions: "Choppy session. No clear trend. Multiple fake breakouts on NQ and ES.",
    keyLevels: "NQ: 18350-18400 range. AAPL: 190 resistance.",
    strategiesFocus: ["Gap & Go"],
    executionRating: 4,
    mentalState: ["Frustrated", "Impatient"],
    mistakes: ["Entered too early", "Didn't wait for confirmation"],
    lessonsLearned: "Don't trade gap plays when macro is uncertain. Wait for the market to absorb the news first.",
    notes: "Bad day. Lost on AAPL gap play. Should have sized down or stayed flat.",
  },
];

// ─── Journal Modal Entry (pre-filled form data for tutorial) ───────────────
export const mockJournalModalEntry = {
  economicEvents: [
    {
      id: "mock-event-1",
      time: "14:00",
      name: "FOMC Minutes",
      forecast: "Hawkish",
      actual: "Hawkish",
      impact: "high" as const,
    },
  ],
  marketConditions: "Trending day with strong momentum. NQ broke out of a 3-day range after FOMC minutes. Internals green all morning — $TICK consistently above zero, A/D line positive.",
  keyLevels: "NQ: 18400 (support/breakout), 18500 (target)\nES: 5280 (support), 5300 (resistance)\nVWAP: 18430 acting as dynamic support",
  strategiesFocus: ["Break & Retest", "Momentum"],
  executionRating: 4,
  mentalState: ["Focused", "Patient"],
  mistakes: [],
  lessonsLearned: "Great session. Waited for the retest confirmation before entering — no FOMO. Still need to work on holding winners longer; exited NQ trade 20 points before the real top.",
  notes: "Strong trending day after FOMC. Took 2 clean trades on NQ and ES. Both setups were from the pre-market plan. Total PnL: +$1,910. Best day this week.",
};

// ─── Stats Summary ─────────────────────────────────────────────────────────
export const mockStatsSummary: StatsSummary = {
  period: "ALL",
  range: { from: dateKey(30), to: dateKey(0) },
  initialBalance: 25000,
  currentBalance: 27060.60,
  returnPercent: 8.24,
  maxDrawdownPercent: 3.2,
  activity: {
    totalTrades: 5,
    openTrades: 1,
    closedTrades: 4,
    canceledTrades: 0,
  },
  realized: {
    closedTrades: 4,
    winners: 3,
    losers: 1,
    breakeven: 0,
    netPnl: 2060.60,
    grossProfit: 2180.60,
    grossLossAbs: 120.00,
    avgPnl: 515.15,
    avgWin: 726.87,
    avgLoss: -120.00,
    winRate: 75.0,
    profitFactor: 18.17,
    expectancy: 515.15,
    averageHoldingHours: 2.5,
    maxDrawdown: 120.00,
    maxWinStreak: 3,
    maxLossStreak: 1,
    bestTrade: 1235.60,
    worstTrade: -120.00,
  },
};

// ─── Stats Equity ──────────────────────────────────────────────────────────
export const mockStatsEquity: StatsEquity = {
  period: "ALL",
  range: { from: dateKey(30), to: dateKey(0) },
  groupBy: "day",
  totalNetPnl: 2060.60,
  realizedTrades: 4,
  initialBalance: 25000,
  cumulativeSeries: [
    { key: dateKey(5), label: dateKey(5), pnl: 270.00, cumulativePnl: 270.00, cumulativePercent: 1.08, tradeCount: 1 },
    { key: dateKey(4), label: dateKey(4), pnl: -120.00, cumulativePnl: 150.00, cumulativePercent: 0.60, tradeCount: 1 },
    { key: dateKey(3), label: dateKey(3), pnl: 675.00, cumulativePnl: 825.00, cumulativePercent: 3.30, tradeCount: 1 },
    { key: dateKey(2), label: dateKey(2), pnl: 1235.60, cumulativePnl: 2060.60, cumulativePercent: 8.24, tradeCount: 1 },
  ],
  recentDailySeries: [
    { key: dateKey(5), label: dateKey(5), pnl: 270.00, cumulativePnl: 270.00, cumulativePercent: 1.08, tradeCount: 1 },
    { key: dateKey(4), label: dateKey(4), pnl: -120.00, cumulativePnl: 150.00, cumulativePercent: 0.60, tradeCount: 1 },
    { key: dateKey(3), label: dateKey(3), pnl: 675.00, cumulativePnl: 825.00, cumulativePercent: 3.30, tradeCount: 1 },
    { key: dateKey(2), label: dateKey(2), pnl: 1235.60, cumulativePnl: 2060.60, cumulativePercent: 8.24, tradeCount: 1 },
  ],
};

// ─── Stats Calendar ────────────────────────────────────────────────────────
function buildMockCalendarDays(): StatsCalendar {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const pnlMap: Record<string, number> = {
    [dateKey(2)]: 1235.60,
    [dateKey(3)]: 675.00,
    [dateKey(4)]: -120.00,
    [dateKey(5)]: 270.00,
  };

  const tradeCountMap: Record<string, number> = {
    [dateKey(2)]: 1,
    [dateKey(3)]: 1,
    [dateKey(4)]: 1,
    [dateKey(5)]: 1,
  };

  const journalMap: Record<string, boolean> = {
    [dateKey(2)]: true,
    [dateKey(4)]: true,
  };

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      date: key,
      dayLabel: String(d),
      pnl: pnlMap[key] ?? 0,
      tradeCount: tradeCountMap[key] ?? 0,
      hasJournal: journalMap[key] ?? false,
      inMonth: true,
    });
  }

  return {
    month,
    monthLabel: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    days,
  };
}

export const mockStatsCalendar: StatsCalendar = buildMockCalendarDays();

// ─── Stats Breakdown ───────────────────────────────────────────────────────
export const mockStatsBreakdown: StatsBreakdown = {
  period: "ALL",
  range: { from: dateKey(30), to: dateKey(0) },
  by: "symbol",
  items: [
    { key: "NQ", label: "NQ", trades: 2, winners: 1, losers: 0, breakeven: 0, winRate: 100, netPnl: 1235.60, avgPnl: 1235.60, avgWin: 1235.60, avgLoss: 0, profitFactor: 999, averageRMultiple: 2.03 },
    { key: "ES", label: "ES", trades: 1, winners: 1, losers: 0, breakeven: 0, winRate: 100, netPnl: 675.00, avgPnl: 675.00, avgWin: 675.00, avgLoss: 0, profitFactor: 999, averageRMultiple: 1.35 },
    { key: "EUR/USD", label: "EUR/USD", trades: 1, winners: 1, losers: 0, breakeven: 0, winRate: 100, netPnl: 270.00, avgPnl: 270.00, avgWin: 270.00, avgLoss: 0, profitFactor: 999, averageRMultiple: 1.80 },
    { key: "AAPL", label: "AAPL", trades: 1, winners: 0, losers: 1, breakeven: 0, winRate: 0, netPnl: -120.00, avgPnl: -120.00, avgWin: 0, avgLoss: -120.00, profitFactor: 0, averageRMultiple: -0.60 },
  ],
};

// ─── Stats Distribution ────────────────────────────────────────────────────
export const mockStatsDistribution: StatsDistribution = {
  period: "ALL",
  range: { from: dateKey(30), to: dateKey(0) },
  metric: "pnl",
  unit: "$",
  sampleCount: 4,
  average: 515.15,
  median: 472.50,
  min: -120.00,
  max: 1235.60,
  bins: [
    { start: -200, end: 0, label: "-200 to 0", count: 1 },
    { start: 0, end: 200, label: "0 to 200", count: 0 },
    { start: 200, end: 400, label: "200 to 400", count: 1 },
    { start: 400, end: 800, label: "400 to 800", count: 1 },
    { start: 800, end: 1400, label: "800 to 1400", count: 1 },
  ],
};

// ─── Stats Time Analysis ───────────────────────────────────────────────────
export const mockStatsTimeAnalysis: StatsTimeAnalysis = {
  period: "ALL",
  range: { from: dateKey(30), to: dateKey(0) },
  weekday: [
    { key: "1", label: "Monday", trades: 1, winners: 1, losers: 0, winRate: 100, netPnl: 270.00, avgPnl: 270.00 },
    { key: "2", label: "Tuesday", trades: 1, winners: 0, losers: 1, winRate: 0, netPnl: -120.00, avgPnl: -120.00 },
    { key: "3", label: "Wednesday", trades: 1, winners: 1, losers: 0, winRate: 100, netPnl: 675.00, avgPnl: 675.00 },
    { key: "4", label: "Thursday", trades: 1, winners: 1, losers: 0, winRate: 100, netPnl: 1235.60, avgPnl: 1235.60 },
    { key: "5", label: "Friday", trades: 0, winners: 0, losers: 0, winRate: 0, netPnl: 0, avgPnl: 0 },
  ],
  hourly: [
    { key: "09", label: "09:00", trades: 2, winners: 1, losers: 1, winRate: 50, netPnl: 150.00, avgPnl: 75.00 },
    { key: "10", label: "10:00", trades: 1, winners: 1, losers: 0, winRate: 100, netPnl: 675.00, avgPnl: 675.00 },
    { key: "14", label: "14:00", trades: 1, winners: 1, losers: 0, winRate: 100, netPnl: 1235.60, avgPnl: 1235.60 },
  ],
  monthly: [
    { key: new Date().toLocaleDateString("en-US", { month: "short" }), label: new Date().toLocaleDateString("en-US", { month: "long" }), trades: 4, winners: 3, losers: 1, winRate: 75, netPnl: 2060.60, avgPnl: 515.15 },
  ],
};
