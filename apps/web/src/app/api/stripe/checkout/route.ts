import { z } from "zod";

import { safeErrorResponse, safeParseJson, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from "@/lib/stripe";
import { requireEnv } from "@/lib/env";

const checkoutSchema = z.object({
  interval: z.enum(["month", "year"]),
});

export const POST = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return safeErrorResponse("Invalid request body", 400);

  const { interval } = parsed.data;
  const priceId = interval === "month" ? STRIPE_PRICE_MONTHLY : STRIPE_PRICE_YEARLY;
  const appUrl = requireEnv("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);

  try {
    // Get or create Stripe customer
    let customerId = user.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data:
        user.subscriptionStatus === "trialing" && user.trialEndsAt
          ? {
              trial_end: Math.floor(user.trialEndsAt.getTime() / 1000),
              metadata: { userId: user.id },
            }
          : { metadata: { userId: user.id } },
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe error:", err);
    return safeErrorResponse("Checkout failed", 500);
  }
}, { skipSubscriptionCheck: true });
