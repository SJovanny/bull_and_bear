export function formatNumber(value: number, fractionDigits = 2) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: fractionDigits });
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function compactPnl(value: number) {
  if (!Number.isFinite(value) || value === 0) {
    return "0";
  }

  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `${value > 0 ? "+" : "-"}${(abs / 1000).toFixed(1)}k`;
  }

  return `${value > 0 ? "+" : ""}${formatNumber(value, 0)}`;
}

export function pnlColorClass(value: number) {
  if (value > 0) return "text-pnl-positive";
  if (value < 0) return "text-pnl-negative";
  return "text-secondary";
}

export function pnlBgClass(value: number) {
  if (value > 0) return "bg-pnl-positive";
  if (value < 0) return "bg-pnl-negative";
  return "bg-slate-400";
}
