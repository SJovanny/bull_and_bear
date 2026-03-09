import type { StatsQuery, StatsTrade } from "./types";

export function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatRange(filters: StatsQuery) {
  return {
    from: filters.from ? filters.from.toISOString() : null,
    to: filters.to ? filters.to.toISOString() : null,
  };
}

export function normalizeLabel(value: string | number | boolean | null | undefined, fallback = "Unspecified") {
  if (value == null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value ? "Followed" : "Not followed";
  }

  return String(value);
}

export function tradePnl(trade: StatsTrade) {
  return toNumber(trade.netPnl);
}

export function tradeRisk(trade: StatsTrade) {
  const value = toNumber(trade.riskAmount);
  return value > 0 ? value : null;
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", timeZone: "UTC" });
}

export function formatWeekLabel(date: Date) {
  return `Wk ${getIsoWeek(date)}`;
}

export function getIsoWeek(date: Date) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / 604800000);
}
