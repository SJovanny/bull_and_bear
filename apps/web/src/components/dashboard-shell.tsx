"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { LogoutButton } from "@/app/auth/logout-button";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

type Account = {
  id: string;
  name: string;
  currency: string;
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/journal", label: "Journal" },
  { href: "/stats", label: "Stats" },
  { href: "/onboarding", label: "Comptes" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = localStorage.getItem("bb_theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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
        // Keep shell resilient even if accounts endpoint fails.
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

  const shellTitle = useMemo(() => {
    if (!subtitle) {
      return title;
    }

    return `${title} · ${subtitle}`;
  }, [title, subtitle]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("bb_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  function handleAccountChange(nextAccountId: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("accountId", nextAccountId);

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    setSelectedAccountId(nextAccountId);
    router.replace(nextUrl, { scroll: false });
    window.dispatchEvent(new CustomEvent("bb-account-change"));
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside
          className={`hidden shrink-0 border-r border-slate-200 bg-white transition-all duration-200 lg:flex lg:flex-col ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="border-b border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p
                className={`text-xs uppercase tracking-[0.12em] text-slate-500 ${
                  isSidebarCollapsed ? "hidden" : "block"
                }`}
              >
                Bull & Bear
              </p>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((value) => !value)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Toggle sidebar"
              >
                {isSidebarCollapsed ? ">" : "<"}
              </button>
            </div>

            <div className="rounded-lg bg-slate-900 px-3 py-3 text-white">
              <p className={`text-xs font-semibold text-sky-300 ${isSidebarCollapsed ? "hidden" : "block"}`}>
                TRADING JOURNAL
              </p>
              <p className={`mt-1 text-sm font-semibold ${isSidebarCollapsed ? "hidden" : "block"}`}>
                Workspace
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {isSidebarCollapsed ? item.label.slice(0, 1) : item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-3">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {shellTitle}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedAccountId}
                  onChange={(event) => handleAccountChange(event.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none ring-sky-500 transition focus:ring-2"
                  aria-label="Choisir un compte"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {theme === "light" ? "Mode sombre" : "Mode clair"}
                </button>
              </div>
            </div>
          </header>

          <div className="p-3 sm:p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
