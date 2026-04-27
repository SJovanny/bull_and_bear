"use client";

import { type ReactNode } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import { Paywall } from "@/components/paywall";
import { TrialPromptModal } from "@/components/trial-prompt-modal";
import LoadingSpinner from "@/components/loading-spinner";

type SubscriptionGateProps = {
  children: ReactNode;
};

/**
 * Wraps page content and shows the trial prompt modal if the user has never
 * subscribed, or the paywall if their subscription/trial has expired.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { loading, hasAccess, hasStripeAccount, trialDaysLeft } = useSubscription();

  if (loading) return <LoadingSpinner />;

  if (!hasAccess) {
    // User has never gone through Stripe checkout → show mandatory trial prompt
    if (!hasStripeAccount) {
      return <TrialPromptModal />;
    }

    // User had a subscription that expired → show paywall
    return <Paywall trialDaysLeft={trialDaysLeft} />;
  }

  return <>{children}</>;
}
