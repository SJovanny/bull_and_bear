import { SubscriptionStatus } from "@prisma/client";

import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/sync
 *
 * Called client-side after Stripe checkout redirect to ensure the DB is
 * up-to-date. This guards against the webhook arriving late (or not at all
 * during local dev).
 */
export const POST = withAuth(async (_request, { user }) => {
  const customerId = user.stripeCustomerId;

  if (!customerId) {
    return Response.json({ synced: false, reason: "no_stripe_customer" });
  }

  // List active/trialing subscriptions for this customer
  const { data: subscriptions } = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });

  const sub = subscriptions[0];
  if (!sub) {
    return Response.json({ synced: false, reason: "no_subscription" });
  }

  // Map Stripe status to our enum
  function mapStatus(s: string): SubscriptionStatus {
    switch (s) {
      case "active": return SubscriptionStatus.ACTIVE;
      case "trialing": return SubscriptionStatus.TRIALING;
      case "past_due": return SubscriptionStatus.PAST_DUE;
      case "canceled": return SubscriptionStatus.CANCELED;
      default: return SubscriptionStatus.EXPIRED;
    }
  }

  const firstItem = sub.items?.data?.[0] as unknown as Record<string, unknown> | undefined;
  const rawPeriodEnd = firstItem?.current_period_end as number | undefined;
  const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000) : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: sub.id,
      subscriptionStatus: mapStatus(sub.status),
      ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
      ...(sub.status === "trialing" && sub.trial_end
        ? { trialEndsAt: new Date(sub.trial_end * 1000) }
        : {}),
      ...(sub.status === "active" ? { trialEndsAt: null } : {}),
    },
  });

  return Response.json({
    synced: true,
    status: sub.status,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  });
}, { skipSubscriptionCheck: true });
