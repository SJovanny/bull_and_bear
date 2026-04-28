"use client";

import { type ReactNode, useState } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import { Paywall } from "@/components/paywall";
import { TrialPromptModal } from "@/components/trial-prompt-modal";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import LoadingSpinner from "@/components/loading-spinner";

type SubscriptionGateProps = {
  children: ReactNode;
};

/**
 * Wraps page content and shows:
 * 1. Profile completion modal if the user hasn't filled in name/country
 * 2. Trial prompt modal if the user has never subscribed
 * 3. Paywall if their subscription/trial has expired
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { loading, hasAccess, hasStripeAccount, trialDaysLeft, profileComplete } = useSubscription();
  const [profileJustCompleted, setProfileJustCompleted] = useState(false);

  if (loading) return <LoadingSpinner />;

  // Step 1: Profile completion (for Google OAuth users missing fields)
  if (!profileComplete && !profileJustCompleted) {
    return <ProfileCompletionModal onComplete={() => setProfileJustCompleted(true)} />;
  }

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
