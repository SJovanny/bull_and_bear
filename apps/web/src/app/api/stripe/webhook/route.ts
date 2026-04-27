import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { requireEnv } from "@/lib/env";

// Stripe requires the raw body for signature verification — disable body parsing
export const runtime = "nodejs";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active": return SubscriptionStatus.ACTIVE;
    case "trialing": return SubscriptionStatus.TRIALING;
    case "past_due": return SubscriptionStatus.PAST_DUE;
    case "canceled": return SubscriptionStatus.CANCELED;
    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
    case "paused":
    default: return SubscriptionStatus.EXPIRED;
  }
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (!user) {
    console.error(`[webhook] No user found for Stripe customer ${customerId}`);
    return;
  }

  // In Stripe API v2026+, current_period_end lives on subscription items
  const firstItem = subscription.items?.data?.[0];
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: mapStripeStatus(subscription.status),
      ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
      ...(subscription.status === "trialing" && subscription.trial_end
        ? { trialEndsAt: new Date(subscription.trial_end * 1000) }
        : {}),
      ...(subscription.status === "active" ? { trialEndsAt: null } : {}),
    },
  });
}

export async function POST(request: Request) {
  const webhookSecret = requireEnv(
    "STRIPE_WEBHOOK_SECRET",
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id,
          );
          await upsertSubscription(sub);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscription(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { subscriptionStatus: SubscriptionStatus.PAST_DUE },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // Recover from PAST_DUE when payment succeeds
        const paidInvoice = event.data.object as Stripe.Invoice;
        const paidCustomerId =
          typeof paidInvoice.customer === "string" ? paidInvoice.customer : paidInvoice.customer?.id;
        // In Stripe v2026+, subscription may live under parent or as a property
        const paidSubId = (paidInvoice as unknown as Record<string, unknown>).subscription as string | undefined;
        if (paidCustomerId && paidSubId) {
          const sub = await stripe.subscriptions.retrieve(paidSubId);
          await upsertSubscription(sub);
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Stripe sends this 3 days before trial ends — log for now,
        // can be extended to send email notifications
        const trialSub = event.data.object as Stripe.Subscription;
        console.log(
          `[webhook] Trial ending soon for subscription ${trialSub.id}, trial_end: ${trialSub.trial_end}`,
        );
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
