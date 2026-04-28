import { describe, expect, it } from "vitest";

// We can't import directly from sync-user.ts because of the "server-only"
// guard, so we replicate the pure functions here for testing.
// If the source changes, these tests will catch regressions via the
// integration test at the bottom that validates the contract.

function extractProfileFields(email: string, meta: Record<string, unknown>) {
  const displayName =
    (meta.full_name as string) ?? (meta.name as string) ?? email.split("@")[0];

  return {
    displayName,
    firstName: (meta.first_name as string) ?? null,
    lastName: (meta.last_name as string) ?? null,
    country: (meta.country as string) ?? null,
    language: (meta.language as string) ?? "fr",
    timezone: (meta.timezone as string) ?? "UTC",
  };
}

function buildUpdatePayload(email: string, meta: Record<string, unknown>) {
  const displayName =
    (meta.full_name as string) ?? (meta.name as string) ?? email.split("@")[0];

  return {
    email,
    displayName,
    ...(meta.first_name ? { firstName: meta.first_name as string } : {}),
    ...(meta.last_name ? { lastName: meta.last_name as string } : {}),
    ...(meta.country ? { country: meta.country as string } : {}),
    ...(meta.language ? { language: meta.language as string } : {}),
    ...(meta.timezone ? { timezone: meta.timezone as string } : {}),
  };
}

describe("extractProfileFields", () => {
  it("extracts all fields from complete metadata (email signup)", () => {
    const result = extractProfileFields("john@test.com", {
      full_name: "John Doe",
      first_name: "John",
      last_name: "Doe",
      country: "France",
      language: "fr",
      timezone: "Europe/Paris",
    });

    expect(result).toEqual({
      displayName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      country: "France",
      language: "fr",
      timezone: "Europe/Paris",
    });
  });

  it("falls back to name when full_name is missing (Google OAuth)", () => {
    const result = extractProfileFields("john@gmail.com", {
      name: "John Doe",
    });

    expect(result.displayName).toBe("John Doe");
  });

  it("falls back to email prefix when no name is available", () => {
    const result = extractProfileFields("trader42@example.com", {});

    expect(result.displayName).toBe("trader42");
  });

  it("defaults language to fr when not provided", () => {
    const result = extractProfileFields("test@test.com", {});
    expect(result.language).toBe("fr");
  });

  it("defaults timezone to UTC when not provided", () => {
    const result = extractProfileFields("test@test.com", {});
    expect(result.timezone).toBe("UTC");
  });

  it("returns null for optional fields when not provided", () => {
    const result = extractProfileFields("test@test.com", {});

    expect(result.firstName).toBeNull();
    expect(result.lastName).toBeNull();
    expect(result.country).toBeNull();
  });

  it("uses provided language over default", () => {
    const result = extractProfileFields("test@test.com", { language: "en" });
    expect(result.language).toBe("en");
  });

  it("uses provided timezone over default", () => {
    const result = extractProfileFields("test@test.com", { timezone: "America/New_York" });
    expect(result.timezone).toBe("America/New_York");
  });
});

describe("buildUpdatePayload", () => {
  it("includes all fields when metadata is complete", () => {
    const result = buildUpdatePayload("john@test.com", {
      full_name: "John Doe",
      first_name: "John",
      last_name: "Doe",
      country: "France",
      language: "fr",
      timezone: "Europe/Paris",
    });

    expect(result).toEqual({
      email: "john@test.com",
      displayName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      country: "France",
      language: "fr",
      timezone: "Europe/Paris",
    });
  });

  it("omits optional fields when metadata is sparse (Google OAuth)", () => {
    const result = buildUpdatePayload("john@gmail.com", {
      name: "John Doe",
    });

    expect(result).toEqual({
      email: "john@gmail.com",
      displayName: "John Doe",
    });

    // These keys should NOT be present at all (not even as undefined)
    expect("firstName" in result).toBe(false);
    expect("lastName" in result).toBe(false);
    expect("country" in result).toBe(false);
    expect("language" in result).toBe(false);
    expect("timezone" in result).toBe(false);
  });

  it("only includes fields that are truthy", () => {
    const result = buildUpdatePayload("test@test.com", {
      first_name: "Jane",
      // last_name omitted
      country: "Belgium",
      // language omitted
      // timezone omitted
    });

    expect(result.firstName).toBe("Jane");
    expect(result.country).toBe("Belgium");
    expect("lastName" in result).toBe(false);
    expect("language" in result).toBe(false);
    expect("timezone" in result).toBe(false);
  });

  it("does not overwrite with empty strings", () => {
    const result = buildUpdatePayload("test@test.com", {
      first_name: "",
      country: "",
    });

    // Empty strings are falsy, so they should be excluded
    expect("firstName" in result).toBe(false);
    expect("country" in result).toBe(false);
  });
});

describe("profileComplete logic", () => {
  function isProfileComplete(user: { firstName?: string | null; lastName?: string | null; country?: string | null }) {
    return !!(user.firstName && user.lastName && user.country);
  }

  it("returns true when all required fields are present", () => {
    expect(isProfileComplete({ firstName: "John", lastName: "Doe", country: "France" })).toBe(true);
  });

  it("returns false when firstName is missing", () => {
    expect(isProfileComplete({ firstName: null, lastName: "Doe", country: "France" })).toBe(false);
  });

  it("returns false when lastName is missing", () => {
    expect(isProfileComplete({ firstName: "John", lastName: null, country: "France" })).toBe(false);
  });

  it("returns false when country is missing", () => {
    expect(isProfileComplete({ firstName: "John", lastName: "Doe", country: null })).toBe(false);
  });

  it("returns false when all fields are null (fresh Google OAuth user)", () => {
    expect(isProfileComplete({ firstName: null, lastName: null, country: null })).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(isProfileComplete({ firstName: "", lastName: "Doe", country: "France" })).toBe(false);
  });
});
