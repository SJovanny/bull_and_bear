"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  computePipInfo,
  defaultContractMultiplier,
} from "@/lib/trade-calc";
import { SYMBOL_SUGGESTIONS } from "@/lib/symbol-database";
import { useTranslation } from "@/lib/i18n/context";
import { TranslationKeys } from "@/lib/i18n/types";
import { useSelectedAccountId } from "@/hooks/use-selected-account-id";

type Account = {
  id: string;
  name: string;
  currency: string;
};

type TradeSide = "LONG" | "SHORT";
type AssetClass =
  | "STOCK"
  | "FUTURES"
  | "FOREX"
  | "CRYPTO"
  | "OPTIONS"
  | "ETF"
  | "INDEX"
  | "CFD"
  | "OTHER";

type TradeOutcome = "WIN" | "LOSS" | "BREAKEVEN";
type ScreenshotSlot = "before" | "during" | "after";

type Step = 1 | 2 | 3 | 4 | 5;

const assetClasses: AssetClass[] = [
  "STOCK",
  "FUTURES",
  "FOREX",
  "CRYPTO",
  "OPTIONS",
  "ETF",
  "INDEX",
  "CFD",
  "OTHER",
];

const getStepConfig = (t: (key: keyof TranslationKeys) => string): Array<{ step: Step; label: string; helper: string }> => [
  { step: 1, label: t("tradeModal.step1"), helper: t("tradeModal.step1Helper") },
  { step: 2, label: t("tradeModal.step2"), helper: t("tradeModal.step2Helper") },
  { step: 3, label: t("tradeModal.step3"), helper: t("tradeModal.step3Helper") },
  { step: 4, label: t("tradeModal.step4"), helper: t("tradeModal.step4Helper") },
  { step: 5, label: t("tradeModal.step5"), helper: t("tradeModal.step5Helper") },
];

const timeframeOptions = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"];
const htfTrendOptions = ["BULLISH", "BEARISH", "RANGING"];
const emotionOptions = [
  "CONFIANT",
  "CALME",
  "ANXIEUX",
  "STRESSE",
  "FOMO",
  "REVENGE",
  "NEUTRE",
  "ENTHOUSIASTE",
];

const symbolSuggestionsByAssetClass: Record<AssetClass, string[]> = {
  STOCK: [...SYMBOL_SUGGESTIONS.STOCK],
  FUTURES: [...SYMBOL_SUGGESTIONS.FUTURES],
  FOREX: [...SYMBOL_SUGGESTIONS.FOREX],
  CRYPTO: [...SYMBOL_SUGGESTIONS.CRYPTO],
  OPTIONS: [...SYMBOL_SUGGESTIONS.OPTIONS],
  ETF: [...SYMBOL_SUGGESTIONS.ETF],
  INDEX: [...SYMBOL_SUGGESTIONS.INDEX],
  CFD: [...SYMBOL_SUGGESTIONS.CFD],
  OTHER: [...SYMBOL_SUGGESTIONS.OTHER],
};

function normalizeSymbolInput(value: string) {
  return value.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9./_-]/g, "");
}

function normalizeTradeSymbol(assetClass: AssetClass, value: string) {
  const normalized = normalizeSymbolInput(value);

  if (assetClass !== "CRYPTO") {
    return normalized;
  }

  return normalized
    .replace(/USDT$/g, "USD")
    .replace(/USDC$/g, "USD")
    .replace(/\/USDT$/g, "/USD")
    .replace(/\/USDC$/g, "/USD");
}

const confluenceOptions = [
  "VWAP",
  "RSI",
  "Support",
  "Resistance",
  "EMA",
  "Order Flow",
  "Structure",
  "MSS",
  "FVG",
  "Liquidite",
  "Volume",
  "Momentum",
  "BOS",
  "Choch",
];

type TradeEntryModalProps = {
  isOpen: boolean;
  initialDate: string;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
  mode?: "create" | "edit";
  tradeId?: string;
  initialTrade?: {
    accountId: string;
    assetClass: AssetClass;
    symbol: string;
    side: TradeSide;
    quantity: string;
    openedAt: string;
    entryPrice: string;
    initialStopLoss: string | null;
    initialTakeProfit: string | null;
    riskAmount: string | null;
    contractMultiplier: string;
    status: "OPEN" | "CLOSED";
    closedAt: string | null;
    exitPrice: string | null;
    fees: string;
    netPnl: string | null;
    setupName: string | null;
    entryTimeframe: string | null;
    higherTimeframeBias: string | null;
    strategyTag: string | null;
    confluences: string[] | null;
    emotionalState: string | null;
    executionRating: number | null;
    planFollowed: boolean | null;
    entryReason: string | null;
    exitReason: string | null;
    lessonLearned: string | null;
    chartScreenshots: string[] | null;
    notes: string | null;
  };
  onSaved?: () => void | Promise<void>;
};

function initialOpenedAt(dateKey: string) {
  return dateKey ? `${dateKey}T09:30` : "";
}

function parseNumber(value: string) {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDateTimeForInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function suggestedMultiplier(assetClass: AssetClass, symbol: string) {
  return defaultContractMultiplier(assetClass, symbol);
}

function formatPreviewNetPnl(value: number) {
  const abs = Math.abs(value);
  const fractionDigits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  });
}

function outcomeFromPnl(value: number): TradeOutcome {
  if (value > 0) return "WIN";
  if (value < 0) return "LOSS";
  return "BREAKEVEN";
}

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function TradeEntryModal({
  isOpen,
  initialDate,
  onClose,
  onCreated,
  mode = "create",
  tradeId,
  initialTrade,
  onSaved,
}: TradeEntryModalProps) {
  const previousPositionStatusRef = useRef<"OPEN" | "CLOSED" | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const selectedAccountFromQuery = useSelectedAccountId();

  const { t } = useTranslation();
  const stepConfig = useMemo(() => getStepConfig(t), [t]);

  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [accountId, setAccountId] = useState("");
  const [assetClass, setAssetClass] = useState<AssetClass>("STOCK");
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<TradeSide>("LONG");
  const [quantity, setQuantity] = useState("1");
  const [openedAt, setOpenedAt] = useState(initialOpenedAt(initialDate));
  const [entryPrice, setEntryPrice] = useState("");

  const [initialStopLoss, setInitialStopLoss] = useState("");
  const [initialTakeProfit, setInitialTakeProfit] = useState("");
  const [riskAmount, setRiskAmount] = useState("");
  const [contractMultiplier, setContractMultiplier] = useState("1");
  const [multiplierTouched, setMultiplierTouched] = useState(false);

  const [positionStatus, setPositionStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const [closedAt, setClosedAt] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [fees, setFees] = useState("0");
  const [netPnl, setNetPnl] = useState("");

  const [setupName, setSetupName] = useState("");
  const [entryTimeframe, setEntryTimeframe] = useState("");
  const [higherTimeframeBias, setHigherTimeframeBias] = useState("");
  const [strategyTag, setStrategyTag] = useState("");
  const [confluences, setConfluences] = useState<string[]>([]);

  const [emotionalState, setEmotionalState] = useState("");
  const [planFollowed, setPlanFollowed] = useState<boolean | null>(null);
  const [executionRating, setExecutionRating] = useState("5");
  const [entryReason, setEntryReason] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [lessonLearned, setLessonLearned] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshotBefore, setScreenshotBefore] = useState<File | null>(null);
  const [screenshotDuring, setScreenshotDuring] = useState<File | null>(null);
  const [screenshotAfter, setScreenshotAfter] = useState<File | null>(null);
  const [existingScreenshotUrls, setExistingScreenshotUrls] = useState<string[]>([]);
  const [dragOverSlot, setDragOverSlot] = useState<ScreenshotSlot | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCurrentStep(1);
    setError(null);

    if (mode === "edit" && initialTrade) {
      setAccountId(initialTrade.accountId ?? "");
      setAssetClass(initialTrade.assetClass ?? "STOCK");
      setSymbol(initialTrade.symbol ?? "");
      setSide(initialTrade.side ?? "LONG");
      setQuantity(initialTrade.quantity ?? "1");
      setOpenedAt(formatDateTimeForInput(initialTrade.openedAt));
      setEntryPrice(initialTrade.entryPrice ?? "");
      setInitialStopLoss(initialTrade.initialStopLoss ?? "");
      setInitialTakeProfit(initialTrade.initialTakeProfit ?? "");
      setRiskAmount(initialTrade.riskAmount ?? "");
      setContractMultiplier(initialTrade.contractMultiplier ?? "1");
      setMultiplierTouched(true);
      setPositionStatus(initialTrade.status ?? "OPEN");
      setClosedAt(formatDateTimeForInput(initialTrade.closedAt));
      setExitPrice(initialTrade.exitPrice ?? "");
      setFees(initialTrade.fees ?? "0");
      setNetPnl(initialTrade.netPnl ?? "");
      setSetupName(initialTrade.setupName ?? "");
      setEntryTimeframe(initialTrade.entryTimeframe ?? "");
      setHigherTimeframeBias(initialTrade.higherTimeframeBias ?? "");
      setStrategyTag(initialTrade.strategyTag ?? "");
      setConfluences(initialTrade.confluences ?? []);
      setEmotionalState(initialTrade.emotionalState ?? "");
      setPlanFollowed(initialTrade.planFollowed ?? null);
      setExecutionRating(initialTrade.executionRating != null ? String(initialTrade.executionRating) : "5");
      setEntryReason(initialTrade.entryReason ?? "");
      setExitReason(initialTrade.exitReason ?? "");
      setLessonLearned(initialTrade.lessonLearned ?? "");
      setNotes(initialTrade.notes ?? "");
      setScreenshotBefore(null);
      setScreenshotDuring(null);
      setScreenshotAfter(null);
      setExistingScreenshotUrls(initialTrade.chartScreenshots ?? []);
      setDragOverSlot(null);
      return;
    }

    setAccountId("");
    setAssetClass("STOCK");
    setSymbol("");
    setSide("LONG");
    setQuantity("1");
    setOpenedAt(initialOpenedAt(initialDate));
    setEntryPrice("");
    setInitialStopLoss("");
    setInitialTakeProfit("");
    setRiskAmount("");
    setContractMultiplier("1");
    setMultiplierTouched(false);
    setPositionStatus("OPEN");
    setClosedAt("");
    setExitPrice("");
    setFees("0");
    setNetPnl("");
    setSetupName("");
    setEntryTimeframe("");
    setHigherTimeframeBias("");
    setStrategyTag("");
    setConfluences([]);
    setEmotionalState("");
    setPlanFollowed(null);
    setExecutionRating("5");
    setEntryReason("");
    setExitReason("");
    setLessonLearned("");
    setNotes("");
    setScreenshotBefore(null);
    setScreenshotDuring(null);
    setScreenshotAfter(null);
    setExistingScreenshotUrls([]);
    setDragOverSlot(null);
  }, [isOpen, initialDate, mode, initialTrade]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function loadAccounts() {
      setAccountsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/accounts");
        const payload = (await response.json()) as { accounts?: Account[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load accounts");
        }

        const accountList = payload.accounts ?? [];
        setAccounts(accountList);

        if (accountList.length > 0) {
          const queryMatch = selectedAccountFromQuery
            ? accountList.find((account) => account.id === selectedAccountFromQuery)?.id
            : null;

          setAccountId((current) => current || queryMatch || accountList[0].id);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      } finally {
        setAccountsLoading(false);
      }
    }

    loadAccounts();
  }, [isOpen, selectedAccountFromQuery]);

  useEffect(() => {
    if (multiplierTouched) {
      return;
    }

    setContractMultiplier(String(suggestedMultiplier(assetClass, symbol)));
  }, [assetClass, symbol, multiplierTouched]);

  useEffect(() => {
    const previousStatus = previousPositionStatusRef.current;

    if (previousStatus === "CLOSED" && positionStatus === "OPEN") {
      setClosedAt("");
      setExitPrice("");
      setNetPnl("");
    }

    previousPositionStatusRef.current = positionStatus;
  }, [positionStatus]);

  const previewNetPnl = useMemo(() => {
    if (positionStatus !== "CLOSED") {
      return null;
    }

    return parseNumber(netPnl);
  }, [positionStatus, netPnl]);

  const previewOutcome = useMemo(() => {
    if (previewNetPnl == null) {
      return null;
    }

    return outcomeFromPnl(previewNetPnl);
  }, [previewNetPnl]);

  const previewPipInfo = useMemo(() => {
    if (positionStatus !== "CLOSED") {
      return null;
    }

    const entry = parseNumber(entryPrice);
    const exit = parseNumber(exitPrice);
    const qty = parseNumber(quantity);

    if (entry == null || exit == null || qty == null) {
      return null;
    }

    const multiplier = parseNumber(contractMultiplier) ?? suggestedMultiplier(assetClass, symbol);

    return computePipInfo({
      assetClass,
      symbol,
      side,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      contractMultiplier: multiplier,
    });
  }, [assetClass, positionStatus, symbol, side, entryPrice, exitPrice, quantity, contractMultiplier]);

  const symbolSuggestions = useMemo(() => {
    return symbolSuggestionsByAssetClass[assetClass] ?? [];
  }, [assetClass]);

  const symbolPlaceholder = useMemo(() => {
    return symbolSuggestions[0] ?? "SYMBOL";
  }, [symbolSuggestions]);

  const screenshotPreviewUrls = useMemo(() => {
    const before = screenshotBefore ? URL.createObjectURL(screenshotBefore) : null;
    const during = screenshotDuring ? URL.createObjectURL(screenshotDuring) : null;
    const after = screenshotAfter ? URL.createObjectURL(screenshotAfter) : null;

    return { before, during, after };
  }, [screenshotBefore, screenshotDuring, screenshotAfter]);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrls.before?.startsWith("blob:")) {
        URL.revokeObjectURL(screenshotPreviewUrls.before);
      }
      if (screenshotPreviewUrls.during?.startsWith("blob:")) {
        URL.revokeObjectURL(screenshotPreviewUrls.during);
      }
      if (screenshotPreviewUrls.after?.startsWith("blob:")) {
        URL.revokeObjectURL(screenshotPreviewUrls.after);
      }
    };
  }, [screenshotPreviewUrls]);

  const canSubmit = useMemo(() => {
    const baseValid = Boolean(
      accountId &&
        symbol.trim() &&
        parseNumber(quantity) != null &&
        parseNumber(entryPrice) != null &&
        openedAt &&
        accounts.length > 0,
    );

    if (!baseValid) {
      return false;
    }

    if (positionStatus === "CLOSED") {
      return Boolean(parseNumber(exitPrice) != null && closedAt);
    }

    return Boolean(
      true,
    );
  }, [accountId, symbol, quantity, entryPrice, openedAt, accounts.length, positionStatus, exitPrice, closedAt]);

  function toggleConfluence(value: string) {
    setConfluences((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function moveStep(direction: "next" | "prev") {
    setCurrentStep((current) => {
      if (direction === "next") {
        return (Math.min(current + 1, 5) as Step);
      }

      return (Math.max(current - 1, 1) as Step);
    });
  }

  function setSlotFile(slot: ScreenshotSlot, file: File | null) {
    if (slot === "before") {
      setScreenshotBefore(file);
      return;
    }

    if (slot === "during") {
      setScreenshotDuring(file);
      return;
    }

    setScreenshotAfter(file);
  }

  function handleSlotDrop(slot: ScreenshotSlot, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOverSlot(null);

    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) {
      return;
    }

    if (!isImageFile(file)) {
      setError("Only image files are allowed for screenshots.");
      return;
    }

    setSlotFile(slot, file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const slotFiles = [screenshotBefore, screenshotDuring, screenshotAfter].filter(
        (file): file is File => file != null,
      );
      const uploadedImages = await Promise.all(slotFiles.map((file) => toDataUrl(file)));

      const endpoint = mode === "edit" && tradeId ? `/api/trades/${tradeId}` : "/api/trades";
      const method = mode === "edit" ? "PATCH" : "POST";
      const requestBody = {
        assetClass,
        symbol: normalizeTradeSymbol(assetClass, symbol),
        side,
        quantity: parseNumber(quantity),
        openedAt: new Date(openedAt).toISOString(),
        entryPrice: parseNumber(entryPrice),
        initialStopLoss: initialStopLoss ? parseNumber(initialStopLoss) : null,
        initialTakeProfit: initialTakeProfit ? parseNumber(initialTakeProfit) : null,
        riskAmount: riskAmount ? parseNumber(riskAmount) : null,
        contractMultiplier: contractMultiplier ? parseNumber(contractMultiplier) : 1,
        status: positionStatus,
        closedAt: closedAt ? new Date(closedAt).toISOString() : null,
        exitPrice: exitPrice ? parseNumber(exitPrice) : null,
        fees: fees ? parseNumber(fees) : 0,
        netPnl: netPnl ? parseNumber(netPnl) : null,
        setupName: setupName.trim() || null,
        entryTimeframe: entryTimeframe || null,
        higherTimeframeBias: higherTimeframeBias || null,
        strategyTag: strategyTag.trim() || null,
        confluences,
        emotionalState: emotionalState || null,
        executionRating: executionRating ? parseNumber(executionRating) : null,
        planFollowed,
        entryReason: entryReason.trim() || null,
        exitReason: exitReason.trim() || null,
        lessonLearned: lessonLearned.trim() || null,
        chartScreenshots: [...existingScreenshotUrls, ...uploadedImages],
        notes: notes.trim() || null,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" ? requestBody : { accountId, ...requestBody }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save trade");
      }

      if (mode === "edit") {
        if (onSaved) {
          await onSaved();
        }
      } else if (onCreated) {
        await onCreated();
      }
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "edit" ? "Modifier le trade" : "Ajouter un trade"}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
                {mode === "create" ? t("tradeModal.newTrade") : t("tradeModal.editTradeTitle")}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                {mode === "edit" ? t("tradeModal.editTrade") : t("tradeModal.wizardTitle")}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t("tradeModal.close")}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {stepConfig.map((item) => {
              const active = currentStep === item.step;
              const done = currentStep > item.step;

              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setCurrentStep(item.step)}
                  className={`rounded-xl border px-2 py-2 text-left transition ${
                    active
                      ? "border-cyan-400 bg-cyan-50"
                      : done
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t("tradeModal.step")} {item.step}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-900">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.helper}</p>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {accountsLoading ? <p className="text-sm text-slate-500">{t("common.loading")}</p> : null}

            {!accountsLoading && accounts.length === 0 ? (
              <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {t("accounts.noAccounts")}
              </p>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("profile.tradingAccounts")} *</span>
                  <select
                    value={accountId}
                    onChange={(event) => setAccountId(event.target.value)}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                    disabled={accounts.length === 0}
                    required
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Asset class *</span>
                  <select
                    value={assetClass}
                    onChange={(event) => setAssetClass(event.target.value as AssetClass)}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  >
                    {assetClasses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("recentTrades.symbol")} *</span>
                  <input
                    value={symbol}
                    onChange={(event) => setSymbol(normalizeSymbolInput(event.target.value))}
                    list="symbol-suggestions"
                    placeholder={symbolPlaceholder}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm uppercase outline-none ring-sky-500 transition focus:ring-2"
                    required
                  />
                  <datalist id="symbol-suggestions">
                    {symbolSuggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                  <p className="text-xs text-slate-500">
                    Suggestions {assetClass}: {symbolSuggestions.join(", ")}
                    {assetClass === "CRYPTO" ? " - privilegie les paires USD pour le graphique." : ""}
                  </p>
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("recentTrades.side")} *</span>
                  <div className="grid h-11 grid-cols-2 rounded-xl border border-slate-300 p-1">
                    <button
                      type="button"
                      onClick={() => setSide("LONG")}
                      className={`rounded-lg text-sm font-semibold ${
                        side === "LONG" ? "bg-emerald-600 text-white" : "text-slate-700"
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("SHORT")}
                      className={`rounded-lg text-sm font-semibold ${
                        side === "SHORT" ? "bg-rose-600 text-white" : "text-slate-700"
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {assetClass === "FOREX" ? t("tradeDetail.quantity") + " (Lots) *" : t("tradeDetail.quantity") + " *"}
                  </span>
                  <input
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    type="number"
                    min="0.000001"
                    step="0.000001"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                    required
                  />
                  {assetClass === "FOREX" && (
                    <p className="text-xs text-slate-500">
                      1 lot = 100,000 | 0.1 = mini | 0.01 = micro
                    </p>
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.openedOn")} *</span>
                  <input
                    value={openedAt}
                    onChange={(event) => setOpenedAt(event.target.value)}
                    type="datetime-local"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.entryPrice")} *</span>
                  <input
                    value={entryPrice}
                    onChange={(event) => setEntryPrice(event.target.value)}
                    type="number"
                    min="0"
                    step="0.000001"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                    required
                  />
                </label>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.stopLoss")}</span>
                  <input
                    value={initialStopLoss}
                    onChange={(event) => setInitialStopLoss(event.target.value)}
                    type="number"
                    min="0"
                    step="0.000001"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.takeProfit")}</span>
                  <input
                    value={initialTakeProfit}
                    onChange={(event) => setInitialTakeProfit(event.target.value)}
                    type="number"
                    min="0"
                    step="0.000001"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.riskAmount")}</span>
                  <input
                    value={riskAmount}
                    onChange={(event) => setRiskAmount(event.target.value)}
                    type="number"
                    min="0"
                    step="0.000001"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                {assetClass !== "FOREX" ? (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">{t("tradeDetail.contractMultiplier")}</span>
                    <input
                      value={contractMultiplier}
                      onChange={(event) => {
                        setContractMultiplier(event.target.value);
                        setMultiplierTouched(true);
                      }}
                      type="number"
                      min="0.000001"
                      step="0.000001"
                      className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                    />
                    <p className="text-xs text-slate-500">
                      Suggestions: NQ=20, ES=50, CL=1000, GC=100, options=100.
                    </p>
                  </label>
                ) : null}
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Position status *</span>
                  <div className="grid h-11 grid-cols-2 rounded-xl border border-slate-300 p-1">
                    <button
                      type="button"
                      onClick={() => setPositionStatus("OPEN")}
                      className={`rounded-lg text-sm font-semibold ${
                        positionStatus === "OPEN" ? "bg-slate-900 text-white" : "text-slate-700"
                      }`}
                    >
                      OPEN
                    </button>
                    <button
                      type="button"
                      onClick={() => setPositionStatus("CLOSED")}
                      className={`rounded-lg text-sm font-semibold ${
                        positionStatus === "CLOSED" ? "bg-slate-900 text-white" : "text-slate-700"
                      }`}
                    >
                      CLOSED
                    </button>
                  </div>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.closedOn")} {positionStatus === "CLOSED" ? "*" : ""}</span>
                  <input
                    value={closedAt}
                    onChange={(event) => setClosedAt(event.target.value)}
                    type="datetime-local"
                    disabled={positionStatus !== "CLOSED"}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition disabled:bg-slate-100 focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.exitPrice")} {positionStatus === "CLOSED" ? "*" : ""}</span>
                  <input
                    value={exitPrice}
                    onChange={(event) => setExitPrice(event.target.value)}
                    type="number"
                    min="0"
                    step="0.000001"
                    disabled={positionStatus !== "CLOSED"}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition disabled:bg-slate-100 focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.fees")}</span>
                  <input
                    value={fees}
                    onChange={(event) => setFees(event.target.value)}
                    type="number"
                    min="0"
                    step="0.000001"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("journalModal.netPnl")}</span>
                  <input
                    value={netPnl}
                    onChange={(event) => setNetPnl(event.target.value)}
                    type="number"
                    step="0.000001"
                    disabled={positionStatus !== "CLOSED"}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition disabled:bg-slate-100 focus:ring-2"
                  />
                </label>

                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Net PnL</p>
                  <p
                    className={`mt-2 text-3xl font-black tabular-nums ${
                      previewNetPnl == null
                        ? "text-slate-500"
                        : previewNetPnl > 0
                          ? "text-emerald-600"
                          : previewNetPnl < 0
                            ? "text-rose-600"
                            : "text-slate-700"
                    }`}
                  >
                    {previewNetPnl == null
                      ? "Renseigne manuellement a la cloture"
                      : formatPreviewNetPnl(previewNetPnl)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Trade status: {previewOutcome ?? "N/A"} {previewOutcome ? "(from PnL)" : ""}
                  </p>
                  {previewPipInfo ? (
                    <p className="mt-1 text-xs text-slate-500 font-medium">
                      {previewPipInfo.unit === "pips" ? "Pip value" : "Value/pt"}: {formatPreviewNetPnl(previewPipInfo.unitValue)} | Move:{" "}
                      {previewPipInfo.unitsMove > 0 ? "+" : ""}
                      {previewPipInfo.unitsMove.toFixed(1)} {previewPipInfo.unit}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Setup name</span>
                  <input
                    value={setupName}
                    onChange={(event) => setSetupName(event.target.value)}
                    placeholder="Opening range breakout"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Entry timeframe</span>
                  <select
                    value={entryTimeframe}
                    onChange={(event) => setEntryTimeframe(event.target.value)}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  >
                    <option value="">Select timeframe</option>
                    {timeframeOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">HTF trend</span>
                  <select
                    value={higherTimeframeBias}
                    onChange={(event) => setHigherTimeframeBias(event.target.value)}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  >
                    <option value="">Select trend</option>
                    {htfTrendOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Strategy tag</span>
                  <input
                    value={strategyTag}
                    onChange={(event) => setStrategyTag(event.target.value)}
                    placeholder="London session"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-slate-700">{t("tradeDetail.confluences")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {confluenceOptions.map((item) => {
                      const selected = confluences.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleConfluence(item)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            selected
                              ? "border-cyan-600 bg-cyan-600 text-white"
                              : "border-slate-300 bg-white text-slate-700"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 5 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.emotionalState")}</span>
                  <select
                    value={emotionalState}
                    onChange={(event) => setEmotionalState(event.target.value)}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  >
                    <option value="">Select emotion</option>
                    {emotionOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.executionRating")} (1-10)</span>
                  <input
                    value={executionRating}
                    onChange={(event) => setExecutionRating(event.target.value)}
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="h-11"
                  />
                  <span className="text-xs font-semibold text-slate-500">{executionRating}/10</span>
                </label>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.planFollowed")}</span>
                  <div className="grid h-11 grid-cols-2 rounded-xl border border-slate-300 p-1">
                    <button
                      type="button"
                      onClick={() => setPlanFollowed(true)}
                      className={`rounded-lg text-sm font-semibold ${
                        planFollowed === true ? "bg-emerald-600 text-white" : "text-slate-700"
                      }`}
                    >
                      {t("tradeDetail.yes")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanFollowed(false)}
                      className={`rounded-lg text-sm font-semibold ${
                        planFollowed === false ? "bg-rose-600 text-white" : "text-slate-700"
                      }`}
                    >
                      {t("tradeDetail.no")}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.screenshots")} (avant / pendant / apres)</span>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        slot: "before" as ScreenshotSlot,
                        label: "Avant",
                        file: screenshotBefore,
                        preview: screenshotPreviewUrls.before ?? existingScreenshotUrls[0] ?? null,
                      },
                      {
                        slot: "during" as ScreenshotSlot,
                        label: "Pendant",
                        file: screenshotDuring,
                        preview: screenshotPreviewUrls.during ?? existingScreenshotUrls[1] ?? null,
                      },
                      {
                        slot: "after" as ScreenshotSlot,
                        label: "Apres",
                        file: screenshotAfter,
                        preview: screenshotPreviewUrls.after ?? existingScreenshotUrls[2] ?? null,
                      },
                    ].map((item) => (
                      <div key={item.slot} className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                        <div
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverSlot(item.slot);
                          }}
                          onDragLeave={() => setDragOverSlot(null)}
                          onDrop={(event) => handleSlotDrop(item.slot, event)}
                          className={`rounded-xl border-2 border-dashed p-3 text-center transition ${
                            dragOverSlot === item.slot
                              ? "border-cyan-500 bg-cyan-50"
                              : "border-slate-300 bg-slate-50"
                          }`}
                        >
                          <label className="block cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                if (file && !isImageFile(file)) {
                                  setError("Only image files are allowed for screenshots.");
                                  return;
                                }

                                setSlotFile(item.slot, file);
                              }}
                            />
                            <p className="text-xs text-slate-600">Drag and drop or click to upload</p>
                            {item.preview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.preview}
                                alt={`${item.label} screenshot preview`}
                                className="mt-2 h-24 w-full rounded-lg object-cover"
                              />
                            ) : (
                              <div className="mt-2 flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-400">
                                Placeholder {item.label}
                              </div>
                            )}
                            <p className="mt-2 truncate text-xs font-semibold text-slate-800">
                              {item.file ? item.file.name : item.preview ? `Existing ${item.label}` : `${item.label} screenshot`}
                            </p>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {existingScreenshotUrls.length > 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {existingScreenshotUrls.length} existing screenshot(s) kept unless replaced.
                    </p>
                  ) : null}
                </div>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.entryReason")}</span>
                  <textarea
                    value={entryReason}
                    onChange={(event) => setEntryReason(event.target.value)}
                    rows={3}
                    placeholder=""
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.exitReason")}</span>
                  <textarea
                    value={exitReason}
                    onChange={(event) => setExitReason(event.target.value)}
                    rows={3}
                    placeholder=""
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.lessonLearned")}</span>
                  <textarea
                    value={lessonLearned}
                    onChange={(event) => setLessonLearned(event.target.value)}
                    rows={3}
                    placeholder=""
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t("tradeDetail.notes")}</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    placeholder=""
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                  />
                </label>
              </div>
            ) : null}

            {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {t("tradeModal.step")} {currentStep}/5 · {currentStep <= 3 ? "Essentiel d'abord" : "Contexte optionnel"}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t("accounts.formCancelBtn")}
              </button>
              <button
                type="button"
                onClick={() => moveStep("prev")}
                disabled={currentStep === 1}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                {t("tradeDetail.previous")}
              </button>
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => moveStep("next")}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  {t("tradeDetail.next")}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t("accounts.formSavingBtn") : t("accounts.formSaveBtn")}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
