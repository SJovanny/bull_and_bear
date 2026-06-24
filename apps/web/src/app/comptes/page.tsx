"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import LoadingSpinner from "@/components/loading-spinner";
import { useTranslation } from "@/lib/i18n/context";
import { formatNumber, pnlColorClass } from "@/lib/format";
import { useTutorialStatus } from "@/hooks/use-tutorial-status";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { tutorialStepsMap } from "@/config/tutorial-steps";
import BrokerConnectModal from "@/components/broker-connect-modal";
import ResyncButton, { type BrokerConnection } from "@/components/resync-button";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [connections, setConnections] = useState<Record<string, BrokerConnection>>({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<TradingAccount | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Broker connect modal state
  const [brokerConnectTarget, setBrokerConnectTarget] = useState<TradingAccount | null>(null);
  const [oauthSelectPayload, setOauthSelectPayload] = useState<string | null>(null);
  const { t } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded, markCompleted } = useTutorialStatus();
  const maxAccountsReached = accounts.length >= 5;

  // Handle OAuth callback query params (?ctrader_success, ?ctrader_error, ?ctrader_select)
  useEffect(() => {
    const success = searchParams.get("ctrader_success");
    const oauthError = searchParams.get("ctrader_error");
    const selectPayload = searchParams.get("ctrader_select");

    if (success === "linked") {
      setMessage("cTrader account connected successfully.");
      void loadConnections();
      router.replace("/comptes");
    } else if (oauthError) {
      const msgs: Record<string, string> = {
        cancelled: "cTrader authorization was cancelled.",
        missing_params: "Invalid OAuth callback parameters.",
        invalid_state: "OAuth state mismatch. Please try again.",
        account_not_found: "Account not found. Please try again.",
        not_configured: "cTrader integration is not configured on this server.",
        token_exchange_failed: "Failed to exchange cTrader authorization code. Please try again.",
      };
      setError(msgs[oauthError] ?? `cTrader error: ${oauthError}`);
      router.replace("/comptes");
    } else if (selectPayload) {
      // Multiple cTrader accounts – need user to pick one.
      // We need to know which account was being connected.
      // The accountId is encoded in the payload itself.
      try {
        const decoded = JSON.parse(
          atob(selectPayload.replace(/-/g, "+").replace(/_/g, "/"))
        ) as { accountId?: string };
        if (decoded.accountId) {
          setOauthSelectPayload(selectPayload);
          // The modal will be shown once accounts are loaded
          // and we can find the matching account
          setLoaded(false); // trigger reload so accounts list is available
        }
      } catch {
        setError("Failed to parse cTrader account selection data.");
        router.replace("/comptes");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function loadConnections() {
    // Fetch broker connections for all accounts in parallel
    if (accounts.length === 0) return;
    try {
      const results = await Promise.all(
        accounts.map((acc) =>
          fetch(`/api/connections/ctrader/accounts?accountId=${encodeURIComponent(acc.id)}`)
            .then((r) => r.json() as Promise<{ connection?: BrokerConnection | null }>)
            .then(({ connection }) => ({ accountId: acc.id, connection }))
            .catch(() => ({ accountId: acc.id, connection: null })),
        ),
      );
      const map: Record<string, BrokerConnection> = {};
      for (const { accountId, connection } of results) {
        if (connection) map[accountId] = connection;
      }
      setConnections(map);
    } catch {
      // non-critical
    }
  }

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

      const loadedAccounts = accountsPayload.accounts ?? [];
      setAccounts(loadedAccounts);
      setBalances(balancesPayload.balances ?? []);
      setLoaded(true);

      // Load broker connections after accounts are available
      if (loadedAccounts.length > 0) {
        const results = await Promise.all(
          loadedAccounts.map((acc) =>
            fetch(`/api/connections/ctrader/accounts?accountId=${encodeURIComponent(acc.id)}`)
              .then((r) => r.json() as Promise<{ connection?: BrokerConnection | null }>)
              .then(({ connection }) => ({ accountId: acc.id, connection }))
              .catch(() => ({ accountId: acc.id, connection: null })),
          ),
        );
        const map: Record<string, BrokerConnection> = {};
        for (const { accountId, connection } of results) {
          if (connection) map[accountId] = connection;
        }
        setConnections(map);

        // If we have a ctrader_select payload waiting, open the modal for the right account
        const selectPayload = searchParams.get("ctrader_select");
        if (selectPayload) {
          try {
            const decoded = JSON.parse(
              atob(selectPayload.replace(/-/g, "+").replace(/_/g, "/"))
            ) as { accountId?: string };
            if (decoded.accountId) {
              const target = loadedAccounts.find((a) => a.id === decoded.accountId);
              if (target) {
                setBrokerConnectTarget(target);
                setOauthSelectPayload(selectPayload);
              }
            }
          } catch {
            // ignore
          }
          router.replace("/comptes");
        }
      }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function confirmArchive() {
    if (!archiveTarget) return;

    const account = archiveTarget;
    setArchiveTarget(null);
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
              disabled={maxAccountsReached && !showCreateForm}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              data-tutorial="accounts-add"
              title={maxAccountsReached ? t("accounts.maxReached") : undefined}
            >
              {showCreateForm && !editingAccountId ? t("accounts.closeBtn") : t("accounts.addAccountBtn")}
            </button>
          </div>

          {maxAccountsReached && !showCreateForm && (
            <p className="mt-1 text-xs text-amber-400">{t("accounts.maxReached")}</p>
          )}
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
                          onClick={() => setArchiveTarget(account)}
                          disabled={isDeletingId === account.id}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-pnl-negative/20 bg-pnl-negative/5 px-3 text-sm font-semibold text-pnl-negative transition hover:bg-pnl-negative/10 disabled:opacity-50"
                        >
                          {isDeletingId === account.id ? t("accounts.deletingBtn") : t("accounts.deleteBtn")}
                        </button>
                      </div>

                      {/* Broker connection / resync section */}
                      {connections[account.id] ? (
                        <ResyncButton
                          connection={connections[account.id]}
                          onSynced={({ imported }) => {
                            if (imported > 0) {
                              setMessage(`${imported} new trade${imported === 1 ? "" : "s"} synced from cTrader.`);
                              void loadBalances();
                            } else {
                              setMessage("Trades already up to date.");
                            }
                          }}
                          onDisconnected={() => {
                            setConnections((prev) => {
                              const next = { ...prev };
                              delete next[account.id];
                              return next;
                            });
                            setMessage("cTrader disconnected.");
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setBrokerConnectTarget(account);
                            setOauthSelectPayload(null);
                          }}
                          className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-surface-1 px-3 text-xs font-semibold text-secondary transition hover:border-brand-500 hover:text-brand-500"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                          Connect cTrader for auto-sync
                        </button>
                      )}
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

      {/* Broker connect modal */}
      {brokerConnectTarget && (
        <BrokerConnectModal
          isOpen={true}
          accountId={brokerConnectTarget.id}
          accountName={brokerConnectTarget.name}
          selectPayload={oauthSelectPayload}
          onClose={() => {
            setBrokerConnectTarget(null);
            setOauthSelectPayload(null);
          }}
          onConnected={() => {
            setBrokerConnectTarget(null);
            setOauthSelectPayload(null);
            void loadConnections();
          }}
        />
      )}

      {/* Archive confirmation modal */}
      {archiveTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setArchiveTarget(null);
            }
          }}
          aria-hidden="true"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("accounts.deleteModalTitle")}
            className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pnl-negative/10">
                <svg className="h-5 w-5 text-pnl-negative" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary font-sans">
                  {t("accounts.deleteModalTitle")}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm text-secondary font-sans">
              {t("accounts.deleteModalDesc").replace("{name}", archiveTarget.name)}
            </p>

            {(archiveTarget._count?.trades ?? 0) > 0 ? (
              <p className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm font-medium text-amber-600 font-sans">
                {t("accounts.deleteModalTradeCount").replace("{count}", String(archiveTarget._count?.trades ?? 0))}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setArchiveTarget(null)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-1 px-4 text-sm font-semibold text-primary transition hover:bg-surface-2"
              >
                {t("accounts.formCancelBtn")}
              </button>
              <button
                type="button"
                onClick={() => void confirmArchive()}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-pnl-negative px-4 text-sm font-semibold text-white transition hover:bg-pnl-negative/90"
              >
                {t("accounts.deleteModalConfirmBtn")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
