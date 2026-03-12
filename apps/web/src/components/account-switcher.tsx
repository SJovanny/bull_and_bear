"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useSelectedAccountId } from "@/hooks/use-selected-account-id";

type Account = {
  id: string;
  name: string;
  currency: string;
};

type AccountBalance = {
  accountId: string;
  currentBalance: number | null;
};

function formatCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function AccountSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balances, setBalances] = useState<Map<string, number>>(new Map());
  const selectedAccountId = useSelectedAccountId();

  useEffect(() => {
    async function loadAccounts() {
      try {
        const [accountsResponse, balancesResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/accounts/balances"),
        ]);

        const accountPayload = (await accountsResponse.json()) as { accounts?: Account[] };
        const balancesPayload = (await balancesResponse.json()) as { balances?: AccountBalance[] };

        if (!accountsResponse.ok) {
          return;
        }

        const accountList = accountPayload.accounts ?? [];
        setAccounts(accountList);

        const balMap = new Map<string, number>();
        for (const b of balancesPayload.balances ?? []) {
          if (b.currentBalance !== null) {
            balMap.set(b.accountId, b.currentBalance);
          }
        }
        setBalances(balMap);

        // Auto-select first account if no accountId in URL
        const currentAccountId = new URLSearchParams(window.location.search).get("accountId");
        if (!currentAccountId && accountList.length > 0) {
          const firstAccountId = accountList[0].id;
          const params = new URLSearchParams(window.location.search);
          params.set("accountId", firstAccountId);
          const nextUrl = `${pathname}?${params.toString()}`;
          router.replace(nextUrl, { scroll: false });
          window.dispatchEvent(
            new CustomEvent("bb-account-change", { detail: { accountId: firstAccountId } }),
          );
        }
      } catch {
        // Keep resilient
      }
    }

    loadAccounts();
  }, [pathname, router]);

  function handleAccountChange(nextAccountId: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("accountId", nextAccountId);

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
    window.dispatchEvent(
      new CustomEvent("bb-account-change", { detail: { accountId: nextAccountId } }),
    );
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <select
      value={selectedAccountId}
      onChange={(event) => handleAccountChange(event.target.value)}
      className="h-10 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2 max-w-[260px]"
      aria-label="Choisir un compte"
    >
      {accounts.map((account) => {
        const bal = balances.get(account.id);
        const label = bal !== undefined
          ? `${account.name} (${account.currency}) · ${formatCompact(bal)}`
          : `${account.name} (${account.currency})`;

        return (
          <option key={account.id} value={account.id}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
