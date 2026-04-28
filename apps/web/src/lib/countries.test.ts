import { describe, expect, it } from "vitest";

import { COUNTRIES } from "./countries";

describe("COUNTRIES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(COUNTRIES)).toBe(true);
    expect(COUNTRIES.length).toBeGreaterThan(150);
  });

  it("is sorted alphabetically", () => {
    const sorted = [...COUNTRIES].sort((a, b) => a.localeCompare(b));
    expect(COUNTRIES).toEqual(sorted);
  });

  it("contains no duplicates", () => {
    const unique = new Set(COUNTRIES);
    expect(unique.size).toBe(COUNTRIES.length);
  });

  it("contains common countries", () => {
    expect(COUNTRIES).toContain("France");
    expect(COUNTRIES).toContain("United States");
    expect(COUNTRIES).toContain("United Kingdom");
    expect(COUNTRIES).toContain("Germany");
    expect(COUNTRIES).toContain("Canada");
    expect(COUNTRIES).toContain("Japan");
  });

  it("every entry is a non-empty string", () => {
    for (const country of COUNTRIES) {
      expect(typeof country).toBe("string");
      expect(country.trim().length).toBeGreaterThan(0);
    }
  });
});
