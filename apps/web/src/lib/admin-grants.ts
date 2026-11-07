import { z } from "zod";

// ─── Subscription grants ─────────────────────────────────────────────────────

export const grantSchema = z.discriminatedUnion("type", [
  /** Free access for N days (stored as TRIALING with a future trialEndsAt). */
  z.object({ type: z.literal("days"), days: z.number().int().min(1).max(3650) }),
  /** Free access with no expiry (stored as ACTIVE without a Stripe subscription). */
  z.object({ type: z.literal("lifetime") }),
  /** Remove any granted access. */
  z.object({ type: z.literal("revoke") }),
]);

export type Grant = z.infer<typeof grantSchema>;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure: turns an admin grant into the Prisma `data` fields for a User.
 * `base` is the date to extend from (the current expiry if still in the future).
 */
export function grantToUserData(grant: Grant, now: Date = new Date(), currentExpiry?: Date | null) {
  switch (grant.type) {
    case "days": {
      const start = currentExpiry && currentExpiry > now ? currentExpiry : now;
      return {
        subscriptionStatus: "TRIALING" as const,
        trialEndsAt: new Date(start.getTime() + grant.days * DAY_MS),
      };
    }
    case "lifetime":
      return { subscriptionStatus: "ACTIVE" as const, trialEndsAt: null };
    case "revoke":
      return { subscriptionStatus: "INACTIVE" as const, trialEndsAt: null };
  }
}
