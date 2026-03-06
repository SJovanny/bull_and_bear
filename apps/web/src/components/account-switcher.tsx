"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Account = {
  id: string;
  name: string;
  currency: string;
};

export function AccountSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    async function loadAccounts() {
      try {
        const response = await fetch("/api/accounts");
        const payload = (await response.json()) as { accounts?: Account[] };

        if (!response.ok) {
          return;
        }

        const accountList = payload.accounts ?? [];
        setAccounts(accountList);

        // Auto-select first account if no accountId in URL
        const currentAccountId = new URLSearchParams(window.location.search).get("accountId");
        if (!currentAccountId && accountList.length > 0) {
          const firstAccountId = accountList[0].id;
          const params = new URLSearchParams(window.location.search);
          params.set("accountId", firstAccountId);
          const nextUrl = `${pathname}?${params.toString()}`;
          setSelectedAccountId(firstAccountId);
          router.replace(nextUrl, { scroll: false });
          window.dispatchEvent(new CustomEvent("bb-account-change"));
        }
      } catch {
        // Keep resilient
      }
    }

    loadAccounts();
  }, [pathname, router]);

  useEffect(() => {
    function syncAccountFromUrl() {
      const accountIdFromQuery = new URLSearchParams(window.location.search).get("accountId");
      setSelectedAccountId(accountIdFromQuery ?? "");
    }

    syncAccountFromUrl();
    window.addEventListener("bb-account-change", syncAccountFromUrl);
    window.addEventListener("popstate", syncAccountFromUrl);

    return () => {
      window.removeEventListener("bb-account-change", syncAccountFromUrl);
      window.removeEventListener("popstate", syncAccountFromUrl);
    };
  }, []);

  function handleAccountChange(nextAccountId: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("accountId", nextAccountId);

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    setSelectedAccountId(nextAccountId);
    router.replace(nextUrl, { scroll: false });
    window.dispatchEvent(new CustomEvent("bb-account-change"));
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <select
      value={selectedAccountId}
      onChange={(event) => handleAccountChange(event.target.value)}
      className="h-10 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2 max-w-[200px]"
      aria-label="Choisir un compte"
    >
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.name} ({account.currency})
        </option>
      ))}
    </select>
  );
}