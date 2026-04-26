"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { TutorialSection } from "@/components/tutorial/tutorial-section";
import LoadingSpinner from "@/components/loading-spinner";
import { useTutorialStatus } from "@/hooks/use-tutorial-status";
import { useSubscription } from "@/hooks/use-subscription";
import { useTranslation } from "@/lib/i18n/context";
import { tutorialStepsMap } from "@/config/tutorial-steps";
import { supabaseClient } from "@/lib/supabase/client";

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
  const router = useRouter();
  const [payload, setPayload] = useState<MePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editTimezone, setEditTimezone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { t, locale } = useTranslation();
  const { tutorialsCompleted, loaded: tutorialLoaded, markCompleted } = useTutorialStatus();
  const { status: subStatus, trialDaysLeft, hasAccess, hasStripeAccount, openPortal } = useSubscription();

  const confirmWord = t("profile.deleteTypePlaceholder");

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

  function startEditing() {
    setEditDisplayName(user?.displayName ?? "");
    setEditTimezone(user?.timezone ?? "UTC");
    setIsEditing(true);
    setError(null);
  }

  async function saveProfile() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: editDisplayName, timezone: editTimezone }),
      });

      const data = (await response.json()) as MePayload;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update profile");
      }

      setPayload((prev) => prev ? { ...prev, user: data.user } : prev);
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const response = await fetch("/api/me/export");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bull-and-bear-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/me", { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Deletion failed");
      }
      // Sign out client-side and redirect
      sessionStorage.removeItem("bb-is-authenticated");
      await supabaseClient.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion failed");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <DashboardShell title={t("profile.title")} skipSubscriptionCheck>
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        {tutorialLoaded && (
          <TutorialProvider
            page="profil"
            steps={tutorialStepsMap.profil}
            tutorialCompleted={tutorialsCompleted.profil === true}
            onCompleted={() => markCompleted("profil")}
          />
        )}

        {error ? (
          <section className="rounded-xl border border-pnl-negative/20 bg-pnl-negative/5 px-4 py-3 text-sm text-pnl-negative font-sans">
            {error}
          </section>
        ) : null}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm" data-tutorial="profile-identity">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">{t("profile.identity")}</p>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-surface-2 px-3 text-xs font-semibold text-primary transition hover:bg-white"
                >
                  {t("accounts.editBtn")}
                </button>
              ) : null}
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-secondary font-sans">{t("profile.displayName")}</p>
                {isEditing ? (
                  <input
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    maxLength={100}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                  />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-primary font-sans">
                    {loading ? "..." : user?.displayName || t("profile.notSet")}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-secondary font-sans">{t("profile.email")}</p>
                <p className="mt-1 text-lg font-semibold text-primary font-sans">
                  {loading ? "..." : user?.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary font-sans">{t("profile.timezone")}</p>
                {isEditing ? (
                  <select
                    value={editTimezone}
                    onChange={(e) => setEditTimezone(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-primary outline-none ring-brand-500 transition focus:ring-2"
                  >
                    {Intl.supportedValuesOf("timeZone").map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-lg font-semibold text-primary font-sans">
                    {loading ? "..." : user?.timezone || "UTC"}
                  </p>
                )}
              </div>
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void saveProfile()}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    {isSaving ? t("accounts.formSavingBtn") : t("accounts.formSaveBtn")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-1 px-4 text-sm font-semibold text-primary transition hover:bg-surface-2"
                  >
                    {t("accounts.formCancelBtn")}
                  </button>
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm" data-tutorial="profile-overview">
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

        {/* ─── Billing / Subscription ────────────────────────────── */}
        <section>
          <article className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">{t("profile.billing")}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-secondary font-sans">{t("profile.billingStatus")}</p>
                <p className="mt-1 text-lg font-semibold text-primary font-sans">
                  {subStatus === "active" && t("profile.billingActive")}
                  {subStatus === "trialing" && hasAccess && t("profile.billingTrial").replace("{days}", String(trialDaysLeft))}
                  {subStatus === "trialing" && !hasAccess && t("profile.billingTrialExpired")}
                  {subStatus === "past_due" && t("profile.billingPastDue")}
                  {subStatus === "canceled" && t("profile.billingCanceled")}
                  {subStatus === "expired" && t("profile.billingExpired")}
                </p>
              </div>
              {hasStripeAccount ? (
                <button
                  type="button"
                  onClick={() => void openPortal()}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-2 px-4 text-sm font-semibold text-primary transition hover:bg-white"
                >
                  {t("profile.manageBilling")}
                </button>
              ) : (
                <a
                  href="/pricing"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  {t("profile.upgradePlan")}
                </a>
              )}
            </div>
          </article>
        </section>

        {/* ─── Data & Privacy ────────────────────────────────────── */}
        <section className="grid gap-4 xl:grid-cols-2">
          {/* Export data */}
          <article className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">{t("profile.exportData")}</p>
            <p className="mt-2 text-sm text-secondary font-sans">{t("profile.exportDataDesc")}</p>
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-2 px-4 text-sm font-semibold text-primary transition hover:bg-white disabled:opacity-50"
            >
              {isExporting ? t("profile.exporting") : t("profile.exportBtn")}
            </button>
          </article>

          {/* Delete account */}
          <article className="rounded-2xl border border-pnl-negative/20 bg-pnl-negative/5 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-pnl-negative font-sans">{t("profile.deleteAccount")}</p>
            <p className="mt-2 text-sm text-secondary font-sans">{t("profile.deleteAccountDesc")}</p>
            <button
              type="button"
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); }}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-pnl-negative/30 bg-pnl-negative/10 px-4 text-sm font-semibold text-pnl-negative transition hover:bg-pnl-negative/20"
            >
              {t("profile.deleteBtn")}
            </button>
          </article>
        </section>

        {/* Tutorial restart section */}
        <TutorialSection tutorialsCompleted={tutorialsCompleted} />
          </>
        )}
      </div>

      {/* ─── Delete Account Modal ──────────────────────────────── */}
      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-pnl-negative/20 bg-surface-1 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-pnl-negative font-sans">{t("profile.deleteModalTitle")}</h2>
            <p className="mt-3 text-sm text-secondary font-sans">{t("profile.deleteModalDesc")}</p>

            <div className="mt-4">
              <label className="text-xs font-semibold text-secondary font-sans">
                {t("profile.deleteModalConfirm")}
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={confirmWord}
                className="mt-1 h-10 w-full rounded-xl border border-pnl-negative/30 bg-surface-2 px-3 text-sm text-primary outline-none transition focus:ring-2 focus:ring-pnl-negative/50"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void handleDeleteAccount()}
                disabled={deleteConfirmText !== confirmWord || isDeleting}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-pnl-negative px-4 text-sm font-semibold text-white transition hover:bg-pnl-negative/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? t("profile.deleting") : t("profile.deleteModalConfirmBtn")}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border bg-surface-1 px-4 text-sm font-semibold text-primary transition hover:bg-surface-2 disabled:opacity-50"
              >
                {t("profile.deleteModalCancelBtn")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
