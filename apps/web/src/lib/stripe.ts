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

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "incomplete";

/**
 * Returns true if the user currently has access to paid features.
 * - "trialing" with a future trialEndsAt → access granted
 * - "active" → access granted
 * - everything else → paywall
 */
export function hasActiveAccess(
  status: string,
  trialEndsAt: Date | null,
): boolean {
  if (status === "active") return true;
  if (status === "trialing" && trialEndsAt && trialEndsAt > new Date()) return true;
  return false;
}
