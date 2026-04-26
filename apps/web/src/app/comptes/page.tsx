"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import LoadingSpinner from "@/components/loading-spinner";
import { useTranslation } from "@/lib/i18n/context";
import { formatNumber, pnlColorClass } from "@/lib/format";
import { useTutorialStatus } from "@/hooks/use-tutorial-status";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { tutorialStepsMap } from "@/config/tutorial-steps";

type AccountType = "CASH" | "MARGIN" | "PROP" | "SIM";

type TradingAccount = {
  id: string;
  name: string;
  broker?: string | null;
  currency: string;
  accountType: AccountType;
  initialBalance?: string | null;
  createdAt?: string;
  _count?: { trades: number };
};

const accountTypeOptions: AccountType[] = ["CASH", "MARGIN", "PROP", "SIM"];

type AccountBalance = {
  accountId: string;
  initialBalance: number | null;
  totalPnl: number;
  currentBalance: number | null;
  returnPercent: number | null;
};

const initialForm = {
  name: "",
  broker: "",
  currency: "USD",
  accountType: "CASH" as AccountType,
  initialBalance: "",
};

export default function ComptesPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded, markCompleted } = useTutorialStatus();

  const canSubmit = useMemo(
    () => form.name.trim().length > 1 && form.currency.trim().length === 3,
    [form.currency, form.name],
  );

  const balanceMap = useMemo(() => {
    const map = new Map<string, AccountBalance>();
    for (const b of balances) {
      map.set(b.accountId, b);
    }
    return map;
  }, [balances]);

  async function loadBalances() {
    try {
      const response = await fetch("/api/accounts/balances");
      const payload = (await response.json()) as { balances?: AccountBalance[]; error?: string };
      setBalances(payload.balances ?? []);
    } catch {
      // Keep resilient — balances are supplementary
    }
  }

  async function loadAccounts() {
    setLoading(true);
    try {
      const [accountsResponse, balancesResponse] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/accounts/balances"),
      ]);

      const accountsPayload = (await accountsResponse.json()) as { accounts?: TradingAccount[]; error?: string };
      const balancesPayload = (await balancesResponse.json()) as { balances?: AccountBalance[]; error?: string };

      if (!accountsResponse.ok) {
        throw new Error(accountsPayload.error ?? "Could not load accounts");
      }

      setAccounts(accountsPayload.accounts ?? []);
      setBalances(balancesPayload.balances ?? []);
      setLoaded(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!loaded) {
      void loadAccounts();
    }
  }, [loaded]);

  function resetForm() {
    setForm(initialForm);
    setEditingAccountId(null);
  }

  function openCreateForm() {
    resetForm();
    setShowCreateForm(true);
    setError(null);
    setMessage(null);
  }

  function openEditForm(account: TradingAccount) {
    setEditingAccountId(account.id);
    setForm({
      name: account.name,
      broker: account.broker ?? "",
      currency: account.currency,
      accountType: account.accountType,
      initialBalance: account.initialBalance ? String(account.initialBalance) : "",
    });
    setShowCreateForm(true);
    setError(null);
    setMessage(null);
  }

  function closeForm() {
    setShowCreateForm(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const payload = {
      name: form.name.trim(),
      broker: form.broker.trim() || null,
      currency: form.currency.trim().toUpperCase(),
      accountType: form.accountType,
      initialBalance: form.initialBalance.trim() ? Number(form.initialBalance) : null,
    };

    try {
      const response = await fetch(editingAccountId ? `/api/accounts/${editingAccountId}` : "/api/accounts", {
        method: editingAccountId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { account?: TradingAccount; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? (editingAccountId ? "Could not update account" : "Could not create account"));
      }

      const nextAccount = data.account;

      if (nextAccount) {
        setAccounts((current) =>
          editingAccountId
            ? current.map((account) => (account.id === editingAccountId ? nextAccount : account))
            : [...current, nextAccount],
        );
        window.dispatchEvent(new CustomEvent("bb-accounts-changed"));
      }

      setMessage(editingAccountId ? t("accounts.updateSuccess") : t("accounts.createSuccess"));
      closeForm();
      // Reload balances after account changes
      void loadBalances();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(account: TradingAccount) {
    const tradeCount = account._count?.trades ?? 0;
    const msg = tradeCount > 0
      ? t("accounts.deleteConfirm").replace("{name}", account.name) + `\n\n${tradeCount} trade(s) will be preserved but hidden.`
      : t("accounts.deleteConfirm").replace("{name}", account.name);
    const confirmed = window.confirm(msg);
    if (!confirmed) {
      return;
    }

    setIsDeletingId(account.id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/accounts/${account.id}`, { method: "DELETE" });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Could not archive account");
      }

      setAccounts((current) => current.filter((item) => item.id !== account.id));
      setBalances((current) => current.filter((item) => item.accountId !== account.id));
      window.dispatchEvent(new CustomEvent("bb-accounts-changed"));
      if (editingAccountId === account.id) {
        closeForm();
      }
      setMessage(t("accounts.deleteSuccess"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("common.error"));
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <DashboardShell title={t("accounts.title")} >
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        {tutorialLoaded && (
          <TutorialProvider
            page="comptes"
            steps={tutorialStepsMap.comptes}
            tutorialCompleted={tutorialsCompleted.comptes === true}
            onCompleted={() => markCompleted("comptes")}
          />
        )}
        {error ? (
          <section className="rounded-xl border border-pnl-negative/20 bg-pnl-negative/5 px-4 py-3 text-sm text-pnl-negative font-sans">
            {error}
          </section>
        ) : null}

        {message ? (
          <section className="rounded-xl border border-pnl-positive/20 bg-pnl-positive/5 px-4 py-3 text-sm text-pnl-positive font-sans">
            {message}
          </section>
        ) : null}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
        <section className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">{t("accounts.tradingAccounts")}</p>
              <p className="mt-1 text-sm text-secondary font-sans">{t("accounts.description")}</p>
            </div>

            <button
              type="button"
              onClick={() => (showCreateForm && !editingAccountId ? closeForm() : openCreateForm())}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
              data-tutorial="accounts-add"
            >
              {showCreateForm && !editingAccountId ? t("accounts.closeBtn") : t("accounts.addAccountBtn")}
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]" data-tutorial="accounts-list">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            {accounts.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 px-6 text-center">
                <p className="text-lg font-semibold text-primary font-sans">{t("accounts.noAccounts")}</p>
                <p className="mt-2 max-w-md text-sm text-secondary font-sans">
                  {t("accounts.createFirstAccount")}
                </p>
                {!showCreateForm ? (
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
                  >
                    {t("accounts.addFirstAccountBtn")}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {accounts.map((account) => {
                  const bal = balanceMap.get(account.id);
                  const hasBalance = bal?.currentBalance != null;

                  return (
                    <article key={account.id} className="rounded-xl border border-border bg-surface-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-primary font-sans">{account.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.08em] text-secondary font-sans">{account.accountType}</p>
                        </div>
                        <span className="rounded-full bg-surface-1 px-2.5 py-1 text-xs font-semibold text-primary font-mono">
                          {account.currency}
                        </span>
                      </div>

                      {hasBalance ? (
                        <div className="mt-3 rounded-lg bg-surface-1 p-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary font-sans">{t("accounts.balance")}</span>
                            <span className={`text-lg font-black tabular-nums font-mono ${pnlColorClass(bal.currentBalance ?? 0)}`}>
                              {formatNumber(bal.currentBalance ?? 0)} {account.currency}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-secondary font-sans">
                            <span>{t("accounts.pnl")}: <span className={`font-semibold font-mono ${pnlColorClass(bal.totalPnl)}`}>{bal.totalPnl > 0 ? "+" : ""}{formatNumber(bal.totalPnl)}</span></span>
                            {bal.returnPercent != null ? (
                              <span className={`font-semibold font-mono ${pnlColorClass(bal.returnPercent)}`}>
                                {bal.returnPercent > 0 ? "+" : ""}{formatNumber(bal.returnPercent, 1)}%
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-3 space-y-2 text-sm text-secondary font-sans">
                        <p>{t("accounts.broker")}: {account.broker || t("accounts.notSet")}</p>
                        {account.initialBalance ? (
                          <p>{t("accounts.startingCapital")}: {formatNumber(Number(account.initialBalance))} {account.currency}</p>
                        ) : null}
                        <p>
                          {t("accounts.created")}: {account.createdAt ? new Date(account.createdAt).toLocaleDateString("en-US") : "-"}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(account)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface-1 px-3 text-sm font-semibold text-primary transition hover:bg-white"
                        >
                          {t("accounts.editBtn")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleArchive(account)}
                          disabled={isDeletingId === account.id}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-pnl-negative/20 bg-pnl-negative/5 px-3 text-sm font-semibold text-pnl-negative transition hover:bg-pnl-negative/10 disabled:opacity-50"
                        >
                          {isDeletingId === account.id ? t("accounts.deletingBtn") : t("accounts.deleteBtn")}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
                {editingAccountId ? t("accounts.editAccountTitle") : t("accounts.addAccountTitle")}
              </p>
              <p className="mt-1 text-sm text-secondary font-sans">
                {editingAccountId
                  ? t("accounts.editAccountDesc")
                  : t("accounts.addAccountDesc")}
              </p>
            </div>

            {showCreateForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-primary font-sans">{t("accounts.formName")}</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder={t("accounts.formNamePlaceholder")}
                    className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-primary font-sans">{t("accounts.formBroker")}</span>
                  <input
                    value={form.broker}
                    onChange={(event) => setForm((current) => ({ ...current, broker: event.target.value }))}
                    placeholder={t("accounts.formBrokerPlaceholder")}
                    className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary font-sans">{t("accounts.formCurrency")}</span>
                    <input
                      value={form.currency}
                      onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                      maxLength={3}
                      placeholder={t("accounts.formCurrencyPlaceholder")}
                      className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm uppercase text-primary outline-none ring-brand-500 transition focus:ring-2"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary font-sans">{t("accounts.formType")}</span>
                    <select
                      value={form.accountType}
                      onChange={(event) => setForm((current) => ({ ...current, accountType: event.target.value as AccountType }))}
                      className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                    >
                      {accountTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-primary font-sans">{t("accounts.formInitialBalance")}</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.initialBalance}
                    onChange={(event) => setForm((current) => ({ ...current, initialBalance: event.target.value }))}
                    placeholder={t("accounts.formInitialBalancePlaceholder")}
                    className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                  />
                  <span className="text-xs text-secondary font-sans">{t("accounts.formInitialBalanceHelp")}</span>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (editingAccountId ? t("accounts.formSavingBtn") : t("accounts.formCreatingBtn")) : editingAccountId ? t("accounts.formSaveBtn") : t("accounts.formCreateBtn")}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface-1 px-5 text-sm font-semibold text-primary transition hover:bg-surface-2"
                  >
                    {t("accounts.formCancelBtn")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-2 px-4 py-5 text-sm text-secondary font-sans">
                {t("accounts.emptySelectionText")}<span className="font-semibold text-primary">{t("accounts.clickAdd")}</span>{t("accounts.toOpenForm")}<span className="font-semibold text-primary">{t("accounts.orChoose")}</span>{t("accounts.onExisting")}
              </div>
            )}
          </article>
        </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
