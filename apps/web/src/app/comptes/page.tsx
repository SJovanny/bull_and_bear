"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";

type AccountType = "CASH" | "MARGIN" | "PROP" | "SIM";

type TradingAccount = {
  id: string;
  name: string;
  broker?: string | null;
  currency: string;
  accountType: AccountType;
  createdAt?: string;
};

const accountTypeOptions: AccountType[] = ["CASH", "MARGIN", "PROP", "SIM"];

const initialForm = {
  name: "",
  broker: "",
  currency: "USD",
  accountType: "CASH" as AccountType,
};

export default function ComptesPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => form.name.trim().length > 1 && form.currency.trim().length === 3,
    [form.currency, form.name],
  );

  async function loadAccounts() {
    try {
      const response = await fetch("/api/accounts");
      const payload = (await response.json()) as { accounts?: TradingAccount[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load accounts");
      }

      setAccounts(payload.accounts ?? []);
      setLoaded(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      setLoaded(true);
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
      }

      setMessage(editingAccountId ? "Trading account updated successfully." : "Trading account created successfully.");
      closeForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(account: TradingAccount) {
    const confirmed = window.confirm(`Delete trading account "${account.name}"?`);
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
        throw new Error(data.error ?? "Could not delete account");
      }

      setAccounts((current) => current.filter((item) => item.id !== account.id));
      if (editingAccountId === account.id) {
        closeForm();
      }
      setMessage("Trading account deleted successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <DashboardShell title="Comptes" subtitle="Manage your trading accounts and add new ones">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
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

        <section className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">Trading Accounts</p>
              <p className="mt-1 text-sm text-secondary font-sans">See every trading account already created under your user, then edit or delete them anytime.</p>
            </div>

            <button
              type="button"
              onClick={() => (showCreateForm && !editingAccountId ? closeForm() : openCreateForm())}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              {showCreateForm && !editingAccountId ? "Close" : "Add account"}
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            {accounts.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 px-6 text-center">
                <p className="text-lg font-semibold text-primary font-sans">No trading accounts yet</p>
                <p className="mt-2 max-w-md text-sm text-secondary font-sans">
                  Create your first trading account to start separating your stats, trades and journal by account.
                </p>
                {!showCreateForm ? (
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
                  >
                    Add your first account
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {accounts.map((account) => (
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

                    <div className="mt-4 space-y-2 text-sm text-secondary font-sans">
                      <p>Broker: {account.broker || "Not set"}</p>
                      <p>
                        Created: {account.createdAt ? new Date(account.createdAt).toLocaleDateString("en-US") : "-"}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(account)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface-1 px-3 text-sm font-semibold text-primary transition hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(account)}
                        disabled={isDeletingId === account.id}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-pnl-negative/20 bg-pnl-negative/5 px-3 text-sm font-semibold text-pnl-negative transition hover:bg-pnl-negative/10 disabled:opacity-50"
                      >
                        {isDeletingId === account.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary font-sans">
                {editingAccountId ? "Edit Account" : "Add Account"}
              </p>
              <p className="mt-1 text-sm text-secondary font-sans">
                {editingAccountId
                  ? "Update the selected trading account."
                  : "Create a separate trading account with its own broker, currency and stats scope."}
              </p>
            </div>

            {showCreateForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-primary font-sans">Account name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Main Futures Account"
                    className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-primary font-sans">Broker</span>
                  <input
                    value={form.broker}
                    onChange={(event) => setForm((current) => ({ ...current, broker: event.target.value }))}
                    placeholder="Tradovate"
                    className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary font-sans">Currency</span>
                    <input
                      value={form.currency}
                      onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                      maxLength={3}
                      placeholder="USD"
                      className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm uppercase text-primary outline-none ring-brand-500 transition focus:ring-2"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary font-sans">Account type</span>
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

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (editingAccountId ? "Saving..." : "Creating...") : editingAccountId ? "Save changes" : "Create account"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface-1 px-5 text-sm font-semibold text-primary transition hover:bg-surface-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-2 px-4 py-5 text-sm text-secondary font-sans">
                Click <span className="font-semibold text-primary">Add account</span> to open the creation form, or choose <span className="font-semibold text-primary">Edit</span> on an existing account.
              </div>
            )}
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
