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
  netPnl: string | null;
};

export type DashboardPeriod = "7D" | "30D" | "YTD" | "ALL";
