"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { useTranslation } from "@/lib/i18n/context";

type MePayload = {
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    timezone?: string | null;
    createdAt?: string;
  };
  accounts?: Array<{ id: string }>;
  error?: string;
};

export default function ProfilPage() {
  const [payload, setPayload] = useState<MePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/me");
        const data = (await response.json()) as MePayload;

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load profile");
        }

        setPayload(data);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const user = payload?.user;
  const accountsCount = payload?.accounts?.length ?? 0;

  return (
    <DashboardShell title={t("profile.title")}>
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        {error ? (
          <section className="rounded-xl border border-pnl-negative/20 bg-pnl-negative/5 px-4 py-3 text-sm text-pnl-negative font-sans">
            {error}
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">{t("profile.identity")}</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-secondary font-sans">{t("profile.displayName")}</p>
                <p className="mt-1 text-lg font-semibold text-primary font-sans">
                  {loading ? "..." : user?.displayName || t("profile.notSet")}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary font-sans">{t("profile.email")}</p>
                <p className="mt-1 text-lg font-semibold text-primary font-sans">
                  {loading ? "..." : user?.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary font-sans">{t("profile.timezone")}</p>
                <p className="mt-1 text-lg font-semibold text-primary font-sans">
                  {loading ? "..." : user?.timezone || "UTC"}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">{t("profile.accountOverview")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 px-4 py-4">
                <p className="text-xs text-secondary font-sans">{t("profile.tradingAccounts")}</p>
                <p className="mt-2 text-3xl font-semibold text-primary font-mono">{loading ? "..." : accountsCount}</p>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-4">
                <p className="text-xs text-secondary font-sans">{t("profile.memberSince")}</p>
                <p className="mt-2 text-lg font-semibold text-primary font-sans">
                  {loading
                    ? "..."
                    : user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")
                      : "-"}
                </p>
              </div>
            </div>

          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
