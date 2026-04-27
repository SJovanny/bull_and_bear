import "server-only";

import Stripe from "stripe";

import { requireEnv } from "@/lib/env";

// ─── Server-side Stripe client ───────────────────────────────────────────────

export const stripe = new Stripe(
  requireEnv("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY),
  { apiVersion: "2026-04-22.dahlia" },
);

// ─── Price IDs (set in .env.local) ──────────────────────────────────────────

export const STRIPE_PRICE_MONTHLY = requireEnv(
  "STRIPE_PRICE_MONTHLY",
  process.env.STRIPE_PRICE_MONTHLY,
);

export const STRIPE_PRICE_YEARLY = requireEnv(
  "STRIPE_PRICE_YEARLY",
  process.env.STRIPE_PRICE_YEARLY,
);

// ─── Subscription status helpers ────────────────────────────────────────────

// Re-export the Prisma enum for use across the app
export { SubscriptionStatus } from "@prisma/client";

/**
 * Returns true if the user currently has access to paid features.
 * - "TRIALING" with a future trialEndsAt → access granted
 * - "ACTIVE" → access granted
 * - everything else → paywall
 */
export function hasActiveAccess(
  status: string,
  trialEndsAt: Date | null,
): boolean {
  if (status === "ACTIVE") return true;
  if (status === "TRIALING" && trialEndsAt && trialEndsAt > new Date()) return true;
  return false;
}
