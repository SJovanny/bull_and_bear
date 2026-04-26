"use client";

import { type ReactNode } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import { Paywall } from "@/components/paywall";
import LoadingSpinner from "@/components/loading-spinner";

type SubscriptionGateProps = {
  children: ReactNode;
};

/**
 * Wraps page content and shows the paywall if the user's trial/subscription
 * has expired. Place inside DashboardShell, around the page content.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { loading, hasAccess, trialDaysLeft } = useSubscription();

  if (loading) return <LoadingSpinner />;
  if (!hasAccess) return <Paywall trialDaysLeft={trialDaysLeft} />;

  return <>{children}</>;
}
