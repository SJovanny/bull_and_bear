import { describe, expect, it } from "vitest";
import { z } from "zod";

// ─── Replicate pure logic from source files for testing ──────────────────────
// (Source files use "server-only" or React hooks, so we replicate the logic.)

// From use-subscription.ts — subscription access logic
function computeAccess(info: {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  isAdmin: boolean;
  hasStripeAccount: boolean;
  hasSubscription: boolean;
}, now: Date) {
  const trialEnd = info.trialEndsAt ? new Date(info.trialEndsAt) : null;
  const isAdmin = info.isAdmin;
  const isTrialing = info.subscriptionStatus === "TRIALING" && trialEnd && trialEnd > now;
  const isActive = info.subscriptionStatus === "ACTIVE";
  const hasAccess = isAdmin || isTrialing || isActive || false;

  const trialDaysLeft =
    isTrialing && trialEnd
      ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  return { hasAccess, isTrialing: !!isTrialing, isActive, trialDaysLeft, hasSubscription: info.hasSubscription };
}

// From checkout/route.ts — trial decision logic
function computeTrialData(
  user: { subscriptionId: string | null; subscriptionStatus: string; trialEndsAt: Date | null },
  skipTrial: boolean,
) {
  const isNewUser = !user.subscriptionId && user.subscriptionStatus === "INACTIVE";
  const hasExistingTrial = user.subscriptionStatus === "TRIALING" && user.trialEndsAt;

  const subscriptionData: Record<string, unknown> = { metadata: { userId: "test" } };
  if (!skipTrial) {
    if (isNewUser) {
      subscriptionData.trial_period_days = 14;
    } else if (hasExistingTrial) {
      subscriptionData.trial_end = Math.floor(user.trialEndsAt!.getTime() / 1000);
    }
  }

  return subscriptionData;
}

// From subscription-gate.tsx — gate decision logic
type GateDecision = "loading" | "profile-incomplete" | "trial-prompt" | "paywall" | "allowed";

function computeGateDecision(state: {
  loading: boolean;
  hasAccess: boolean;
  hasSubscription: boolean;
  profileComplete: boolean;
}): GateDecision {
  if (state.loading) return "loading";
  if (!state.profileComplete) return "profile-incomplete";
  if (!state.hasAccess) {
    if (!state.hasSubscription) return "trial-prompt";
    return "paywall";
  }
  return "allowed";
}

// From api/notes/route.ts — notes validation schema
const notesSchema = z.object({
  content: z.string().max(5000),
});

// From stripe.ts — hasActiveAccess
function hasActiveAccess(status: string, trialEndsAt: Date | null): boolean {
  if (status === "ACTIVE") return true;
  if (status === "TRIALING" && trialEndsAt && trialEndsAt > new Date()) return true;
  return false;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("subscription access logic (use-subscription)", () => {
  const now = new Date("2026-04-29T12:00:00Z");

  it("grants access for ACTIVE status", () => {
    const result = computeAccess({
      subscriptionStatus: "ACTIVE",
      trialEndsAt: null,
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);

    expect(result.hasAccess).toBe(true);
    expect(result.isActive).toBe(true);
    expect(result.trialDaysLeft).toBe(0);
  });

  it("grants access for TRIALING with future trial end", () => {
    const result = computeAccess({
      subscriptionStatus: "TRIALING",
      trialEndsAt: "2026-05-10T12:00:00Z",
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);

    expect(result.hasAccess).toBe(true);
    expect(result.isTrialing).toBe(true);
    expect(result.trialDaysLeft).toBe(11);
  });

  it("denies access for TRIALING with expired trial end", () => {
    const result = computeAccess({
      subscriptionStatus: "TRIALING",
      trialEndsAt: "2026-04-28T12:00:00Z",
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);

    expect(result.hasAccess).toBe(false);
    expect(result.isTrialing).toBe(false);
    expect(result.trialDaysLeft).toBe(0);
  });

  it("denies access for INACTIVE status", () => {
    const result = computeAccess({
      subscriptionStatus: "INACTIVE",
      trialEndsAt: null,
      isAdmin: false,
      hasStripeAccount: false,
      hasSubscription: false,
    }, now);

    expect(result.hasAccess).toBe(false);
  });

  it("denies access for CANCELED status", () => {
    const result = computeAccess({
      subscriptionStatus: "CANCELED",
      trialEndsAt: null,
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);

    expect(result.hasAccess).toBe(false);
  });

  it("denies access for EXPIRED status", () => {
    const result = computeAccess({
      subscriptionStatus: "EXPIRED",
      trialEndsAt: null,
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);

    expect(result.hasAccess).toBe(false);
  });

  it("grants access for admin regardless of subscription status", () => {
    const result = computeAccess({
      subscriptionStatus: "INACTIVE",
      trialEndsAt: null,
      isAdmin: true,
      hasStripeAccount: false,
      hasSubscription: false,
    }, now);

    expect(result.hasAccess).toBe(true);
  });

  it("computes trialDaysLeft correctly for 1 day remaining", () => {
    const result = computeAccess({
      subscriptionStatus: "TRIALING",
      trialEndsAt: "2026-04-30T11:00:00Z",
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);

    expect(result.trialDaysLeft).toBe(1);
  });

  it("returns 0 trialDaysLeft when not trialing", () => {
    const result = computeAccess({
      subscriptionStatus: "ACTIVE",
      trialEndsAt: null,
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);

    expect(result.trialDaysLeft).toBe(0);
  });

  it("correctly exposes hasSubscription from user info", () => {
    const withSub = computeAccess({
      subscriptionStatus: "CANCELED",
      trialEndsAt: null,
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: true,
    }, now);
    expect(withSub.hasSubscription).toBe(true);

    const withoutSub = computeAccess({
      subscriptionStatus: "INACTIVE",
      trialEndsAt: null,
      isAdmin: false,
      hasStripeAccount: true,
      hasSubscription: false,
    }, now);
    expect(withoutSub.hasSubscription).toBe(false);
  });
});

describe("checkout trial logic", () => {
  it("gives 14-day trial to new user without skipTrial", () => {
    const result = computeTrialData(
      { subscriptionId: null, subscriptionStatus: "INACTIVE", trialEndsAt: null },
      false,
    );
    expect(result.trial_period_days).toBe(14);
    expect(result.trial_end).toBeUndefined();
  });

  it("gives NO trial to new user with skipTrial=true", () => {
    const result = computeTrialData(
      { subscriptionId: null, subscriptionStatus: "INACTIVE", trialEndsAt: null },
      true,
    );
    expect(result.trial_period_days).toBeUndefined();
    expect(result.trial_end).toBeUndefined();
  });

  it("preserves existing trial end for TRIALING user without skipTrial", () => {
    const trialEnd = new Date("2026-05-10T00:00:00Z");
    const result = computeTrialData(
      { subscriptionId: "sub_123", subscriptionStatus: "TRIALING", trialEndsAt: trialEnd },
      false,
    );
    expect(result.trial_end).toBe(Math.floor(trialEnd.getTime() / 1000));
    expect(result.trial_period_days).toBeUndefined();
  });

  it("gives NO trial to TRIALING user with skipTrial=true", () => {
    const trialEnd = new Date("2026-05-10T00:00:00Z");
    const result = computeTrialData(
      { subscriptionId: "sub_123", subscriptionStatus: "TRIALING", trialEndsAt: trialEnd },
      true,
    );
    expect(result.trial_end).toBeUndefined();
    expect(result.trial_period_days).toBeUndefined();
  });

  it("gives NO trial to returning user (CANCELED) without skipTrial", () => {
    const result = computeTrialData(
      { subscriptionId: "sub_123", subscriptionStatus: "CANCELED", trialEndsAt: null },
      false,
    );
    expect(result.trial_period_days).toBeUndefined();
    expect(result.trial_end).toBeUndefined();
  });

  it("gives NO trial to user with subscriptionId even if status is INACTIVE", () => {
    // Edge case: user has a subscriptionId but status was reset to INACTIVE
    const result = computeTrialData(
      { subscriptionId: "sub_123", subscriptionStatus: "INACTIVE", trialEndsAt: null },
      false,
    );
    expect(result.trial_period_days).toBeUndefined();
  });

  it("always includes metadata regardless of trial settings", () => {
    const result = computeTrialData(
      { subscriptionId: null, subscriptionStatus: "INACTIVE", trialEndsAt: null },
      true,
    );
    expect(result.metadata).toEqual({ userId: "test" });
  });
});

describe("subscription gate decision", () => {
  it("returns loading when loading is true", () => {
    expect(computeGateDecision({
      loading: true, hasAccess: false, hasSubscription: false, profileComplete: true,
    })).toBe("loading");
  });

  it("returns profile-incomplete when profile is not complete", () => {
    expect(computeGateDecision({
      loading: false, hasAccess: false, hasSubscription: false, profileComplete: false,
    })).toBe("profile-incomplete");
  });

  it("returns trial-prompt for user without access and no subscription", () => {
    expect(computeGateDecision({
      loading: false, hasAccess: false, hasSubscription: false, profileComplete: true,
    })).toBe("trial-prompt");
  });

  it("returns paywall for user without access but with prior subscription", () => {
    expect(computeGateDecision({
      loading: false, hasAccess: false, hasSubscription: true, profileComplete: true,
    })).toBe("paywall");
  });

  it("returns allowed for user with access", () => {
    expect(computeGateDecision({
      loading: false, hasAccess: true, hasSubscription: true, profileComplete: true,
    })).toBe("allowed");
  });

  it("returns trial-prompt (not paywall) for user who only created a Stripe customer but never subscribed", () => {
    // This is the key bug fix: user started checkout (has stripeCustomerId) but
    // pressed back before completing — hasSubscription is still false
    expect(computeGateDecision({
      loading: false, hasAccess: false, hasSubscription: false, profileComplete: true,
    })).toBe("trial-prompt");
  });
});

describe("notes validation schema", () => {
  it("accepts valid content", () => {
    const result = notesSchema.safeParse({ content: "My trading rules" });
    expect(result.success).toBe(true);
  });

  it("accepts empty string", () => {
    const result = notesSchema.safeParse({ content: "" });
    expect(result.success).toBe(true);
  });

  it("rejects content over 5000 chars", () => {
    const result = notesSchema.safeParse({ content: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("accepts content at exactly 5000 chars", () => {
    const result = notesSchema.safeParse({ content: "a".repeat(5000) });
    expect(result.success).toBe(true);
  });

  it("rejects missing content field", () => {
    const result = notesSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string content", () => {
    const result = notesSchema.safeParse({ content: 123 });
    expect(result.success).toBe(false);
  });
});

describe("hasActiveAccess", () => {
  it("returns true for ACTIVE status", () => {
    expect(hasActiveAccess("ACTIVE", null)).toBe(true);
  });

  it("returns true for TRIALING with future date", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(hasActiveAccess("TRIALING", future)).toBe(true);
  });

  it("returns false for TRIALING with past date", () => {
    const past = new Date(Date.now() - 1000);
    expect(hasActiveAccess("TRIALING", past)).toBe(false);
  });

  it("returns false for TRIALING with null date", () => {
    expect(hasActiveAccess("TRIALING", null)).toBe(false);
  });

  it("returns false for INACTIVE", () => {
    expect(hasActiveAccess("INACTIVE", null)).toBe(false);
  });

  it("returns false for CANCELED", () => {
    expect(hasActiveAccess("CANCELED", null)).toBe(false);
  });

  it("returns false for EXPIRED", () => {
    expect(hasActiveAccess("EXPIRED", null)).toBe(false);
  });

  it("returns false for PAST_DUE", () => {
    expect(hasActiveAccess("PAST_DUE", null)).toBe(false);
  });
});

describe("sessionStorage auth cache logic", () => {
  // Replicate the landing page checkAuth logic
  function checkAuthDecision(params: { authError?: string; cached?: string | null }) {
    if (params.authError === "unauthorized") {
      return { action: "clear-cache", isAuthenticated: false };
    }

    if (params.cached !== null && params.cached !== undefined) {
      return { action: "use-cache", isAuthenticated: params.cached === "true" };
    }

    return { action: "fetch-api" };
  }

  it("clears cache and sets unauthenticated when authError=unauthorized", () => {
    const result = checkAuthDecision({ authError: "unauthorized", cached: "true" });
    expect(result.action).toBe("clear-cache");
    expect(result.isAuthenticated).toBe(false);
  });

  it("uses cached true value when no auth error", () => {
    const result = checkAuthDecision({ cached: "true" });
    expect(result.action).toBe("use-cache");
    expect(result.isAuthenticated).toBe(true);
  });

  it("uses cached false value when no auth error", () => {
    const result = checkAuthDecision({ cached: "false" });
    expect(result.action).toBe("use-cache");
    expect(result.isAuthenticated).toBe(false);
  });

  it("falls back to API fetch when no cache and no error", () => {
    const result = checkAuthDecision({ cached: null });
    expect(result.action).toBe("fetch-api");
  });

  it("prioritizes authError over cached value", () => {
    // Even if cache says "true", authError should override
    const result = checkAuthDecision({ authError: "unauthorized", cached: "true" });
    expect(result.isAuthenticated).toBe(false);
  });
});
