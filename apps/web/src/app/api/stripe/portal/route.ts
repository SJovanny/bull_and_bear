import { safeErrorResponse, withAuth } from "@/lib/api";
import { stripe } from "@/lib/stripe";
import { requireEnv } from "@/lib/env";

export const POST = withAuth(async (_request, { user }) => {
  if (!user.stripeCustomerId) {
    return safeErrorResponse("No billing account found", 404);
  }

  const appUrl = requireEnv("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/profil`,
  });

  return Response.json({ url: session.url });
}, { skipSubscriptionCheck: true });
