import { describe, expect, it } from "vitest";

import { grantToUserData } from "./admin-grants";


const now = new Date("2026-01-01T00:00:00Z");

describe("grantToUserData", () => {
  it("grants N days from now when no current expiry", () => {
    const r = grantToUserData({ type: "days", days: 30 }, now);
    expect(r.subscriptionStatus).toBe("TRIALING");
    expect(r.trialEndsAt?.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });

  it("extends from a future expiry", () => {
    const r = grantToUserData({ type: "days", days: 10 }, now, new Date("2026-01-11T00:00:00Z"));
    expect(r.trialEndsAt?.toISOString()).toBe("2026-01-21T00:00:00.000Z");
  });

  it("ignores a past expiry", () => {
    const r = grantToUserData({ type: "days", days: 1 }, now, new Date("2025-01-01T00:00:00Z"));
    expect(r.trialEndsAt?.toISOString()).toBe("2026-01-02T00:00:00.000Z");
  });

  it("lifetime is ACTIVE without expiry; revoke is INACTIVE", () => {
    expect(grantToUserData({ type: "lifetime" }, now)).toEqual({ subscriptionStatus: "ACTIVE", trialEndsAt: null });
    expect(grantToUserData({ type: "revoke" }, now)).toEqual({ subscriptionStatus: "INACTIVE", trialEndsAt: null });
  });
});
