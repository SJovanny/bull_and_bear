"use client";

import { useEffect, useState } from "react";

type SubscriptionInfo = {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
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
    fetch("/api/me")
      .then((r) => r.json())
      .then((data: { user?: SubscriptionInfo }) => {
        if (data.user) setInfo(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const trialEnd = info?.trialEndsAt ? new Date(info.trialEndsAt) : null;
  const isTrialing = info?.subscriptionStatus === "trialing" && trialEnd && trialEnd > now;
  const isActive = info?.subscriptionStatus === "active";
  const hasAccess = isTrialing || isActive || false;

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
    status: info?.subscriptionStatus ?? "trialing",
    trialDaysLeft,
    hasStripeAccount: !!info?.stripeCustomerId,
    checkout,
    openPortal,
  };
}
