"use client";

import { useEffect, useState } from "react";

type SubscriptionInfo = {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  hasStripeAccount: boolean;
  isAdmin: boolean;
};

type SubscriptionState = {
  /** True while the initial fetch is in progress */
  loading: boolean;
  /** Whether the user has access to paid features right now */
  hasAccess: boolean;
  /** Subscription status: trialing | active | past_due | canceled | expired */
  status: string;
  /** Days remaining in the trial (0 if not trialing or expired) */
  trialDaysLeft: number;
  /** Whether the user has a Stripe customer ID (has interacted with billing) */
  hasStripeAccount: boolean;
  /** Redirect to Stripe Checkout */
  checkout: (interval: "month" | "year") => Promise<void>;
  /** Redirect to Stripe Customer Portal */
  openPortal: () => Promise<void>;
};

export function useSubscription(): SubscriptionState {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // After Stripe checkout redirect, sync the subscription before reading
        // the user — the webhook may not have arrived yet.
        const params = new URLSearchParams(window.location.search);
        if (params.get("checkout") === "success") {
          await fetch("/api/stripe/sync", { method: "POST" });
          // Clean the query param so we don't sync on every refresh
          const url = new URL(window.location.href);
          url.searchParams.delete("checkout");
          window.history.replaceState({}, "", url.pathname + url.search);
        }

        const res = await fetch("/api/me");
        const data = (await res.json()) as { user?: SubscriptionInfo };
        if (data.user) setInfo(data.user);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, []);

  const now = new Date();
  const trialEnd = info?.trialEndsAt ? new Date(info.trialEndsAt) : null;
  const isAdmin = info?.isAdmin ?? false;
  const isTrialing = info?.subscriptionStatus === "TRIALING" && trialEnd && trialEnd > now;
  const isActive = info?.subscriptionStatus === "ACTIVE";
  const hasAccess = isAdmin || isTrialing || isActive || false;

  const trialDaysLeft =
    isTrialing && trialEnd
      ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  async function checkout(interval: "month" | "year") {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const data = (await res.json()) as { url?: string };
    if (data.url) window.location.href = data.url;
  }

  async function openPortal() {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
    });
    const data = (await res.json()) as { url?: string };
    if (data.url) window.location.href = data.url;
  }

  return {
    loading,
    hasAccess,
    status: info?.subscriptionStatus ?? "INACTIVE",
    trialDaysLeft,
    hasStripeAccount: info?.hasStripeAccount ?? false,
    checkout,
    openPortal,
  };
}
