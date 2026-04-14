"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useSelectedAccountId } from "@/hooks/use-selected-account-id";
import { useTranslation } from "@/lib/i18n/context";

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
  const { t } = useTranslation();

  const syncAccountSelection = useCallback((accountList: Account[]) => {
    const params = new URLSearchParams(window.location.search);
    const currentAccountId = params.get("accountId");

    if (accountList.length === 0) {
      if (!currentAccountId) {
        return;
      }

      params.delete("accountId");
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
      window.dispatchEvent(new CustomEvent("bb-account-change", { detail: { accountId: "" } }));
      return;
    }

    if (currentAccountId && accountList.some((account) => account.id === currentAccountId)) {
      return;
    }

    const nextAccountId = accountList[0].id;
    params.set("accountId", nextAccountId);
    const nextUrl = `${pathname}?${params.toString()}`;
    router.replace(nextUrl, { scroll: false });
    window.dispatchEvent(new CustomEvent("bb-account-change", { detail: { accountId: nextAccountId } }));
  }, [pathname, router]);

  const loadAccounts = useCallback(async () => {
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
      syncAccountSelection(accountList);
    } catch {
      // Keep resilient
    }
  }, [syncAccountSelection]);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadAccounts();
    }, 0);

    function handleAccountsChanged() {
      void loadAccounts();
    }

    window.addEventListener("bb-accounts-changed", handleAccountsChanged);
    return () => {
      window.clearTimeout(initialLoadTimer);
      window.removeEventListener("bb-accounts-changed", handleAccountsChanged);
    };
  }, [loadAccounts]);

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
      className="h-10 min-w-0 w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2 sm:w-auto sm:max-w-[260px]"
      aria-label={t("accountSwitcher.label")}
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
