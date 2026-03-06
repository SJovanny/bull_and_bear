"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";

type AccountType = "CASH" | "MARGIN" | "PROP" | "SIM";

const accountTypeOptions: AccountType[] = ["CASH", "MARGIN", "PROP", "SIM"];

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [broker, setBroker] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [accountType, setAccountType] = useState<AccountType>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 1 && currency.trim().length === 3, [name, currency]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          broker: broker.trim() || null,
          currency: currency.trim().toUpperCase(),
          accountType,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not create account");
      }

      setMessage("Account created successfully. You can now add your first trade.");
      setName("");
      setBroker("");
      setCurrency("USD");
      setAccountType("CASH");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell
      title="Comptes"
      subtitle="Configure tes comptes de trading pour connecter les données"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Account name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Main Futures Account"
                className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Broker (optional)</span>
              <input
                value={broker}
                onChange={(event) => setBroker(event.target.value)}
                placeholder="Tradovate"
                className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Currency</span>
              <input
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                maxLength={3}
                placeholder="USD"
                className="h-11 rounded-xl border border-slate-300 px-3 text-sm uppercase outline-none ring-sky-500 transition focus:ring-2"
                required
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Account type</span>
              <select
                value={accountType}
                onChange={(event) => setAccountType(event.target.value as AccountType)}
                className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-sky-500 transition focus:ring-2"
              >
                {accountTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {message ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
            <Link href="/journal" className="text-sm font-medium text-sky-700 hover:text-sky-600">
              Continue to journal
            </Link>
            <Link href="/journal" className="text-sm font-medium text-sky-700 hover:text-sky-600">
              Go to journal
            </Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
