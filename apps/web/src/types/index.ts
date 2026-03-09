export type Account = {
  id: string;
  name: string;
  currency: string;
};

export type Trade = {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: string;
  entryPrice: string;
  exitPrice: string | null;
  status: string;
  openedAt: string;
  closedAt?: string | null;
  netPnl: string | null;
  riskAmount?: string | null;
};

export type DashboardPeriod = "7D" | "30D" | "YTD" | "ALL";

export type StatsPeriod = DashboardPeriod;

export type StatsRange = {
  from: string | null;
  to: string | null;
};

export type StatsSummary = {
  period: StatsPeriod;
  range: StatsRange;
  activity: {
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    canceledTrades: number;
  };
  realized: {
    closedTrades: number;
    winners: number;
    losers: number;
    breakeven: number;
    netPnl: number;
    grossProfit: number;
    grossLossAbs: number;
    avgPnl: number;
    avgWin: number;
    avgLoss: number;
    winRate: number;
    profitFactor: number;
    expectancy: number;
    averageHoldingHours: number;
    maxWinStreak: number;
    maxLossStreak: number;
    bestTrade: number;
    worstTrade: number;
  };
};

export type EquityPoint = {
  key: string;
  label: string;
  pnl: number;
  cumulativePnl: number;
  tradeCount: number;
};

export type StatsEquity = {
  period: StatsPeriod;
  range: StatsRange;
  groupBy: "day" | "week" | "month";
  totalNetPnl: number;
  realizedTrades: number;
  cumulativeSeries: EquityPoint[];
  recentDailySeries: EquityPoint[];
};

export type CalendarDay = {
  date: string;
  dayLabel: string;
  pnl: number;
  tradeCount: number;
  hasJournal: boolean;
  inMonth: boolean;
};

export type StatsCalendar = {
  month: string;
  monthLabel: string;
  days: CalendarDay[];
};

export type BreakdownKey =
  | "symbol"
  | "setupName"
  | "strategyTag"
  | "assetClass"
  | "side"
  | "entryTimeframe"
  | "higherTimeframeBias"
  | "planFollowed"
  | "emotionalState"
  | "executionRating";

export type StatsBreakdownItem = {
  key: string;
  label: string;
  trades: number;
  winners: number;
  losers: number;
  breakeven: number;
  winRate: number;
  netPnl: number;
  avgPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  averageRMultiple: number | null;
};

export type StatsBreakdown = {
  period: StatsPeriod;
  range: StatsRange;
  by: BreakdownKey;
  items: StatsBreakdownItem[];
};

export type DistributionMetric = "pnl" | "rMultiple" | "holdingTime";

export type DistributionBin = {
  start: number;
  end: number;
  label: string;
  count: number;
};

export type StatsDistribution = {
  period: StatsPeriod;
  range: StatsRange;
  metric: DistributionMetric;
  unit: string;
  sampleCount: number;
  average: number;
  median: number;
  min: number;
  max: number;
  bins: DistributionBin[];
};

export type TimeBucket = {
  key: string;
  label: string;
  trades: number;
  winners: number;
  losers: number;
  winRate: number;
  netPnl: number;
  avgPnl: number;
};

export type StatsTimeAnalysis = {
  period: StatsPeriod;
  range: StatsRange;
  weekday: TimeBucket[];
  hourly: TimeBucket[];
  monthly: TimeBucket[];
};
