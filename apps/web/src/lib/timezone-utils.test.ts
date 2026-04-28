import { describe, expect, it } from "vitest";

import { getTimezoneOptions, formatTimezoneDisplay } from "./timezone-utils";

describe("getTimezoneOptions", () => {
  it("returns a non-empty array", () => {
    const options = getTimezoneOptions();
    expect(options.length).toBeGreaterThan(100);
  });

  it("each option has a value and label", () => {
    const options = getTimezoneOptions();
    for (const opt of options) {
      expect(typeof opt.value).toBe("string");
      expect(typeof opt.label).toBe("string");
      expect(opt.value.length).toBeGreaterThan(0);
      expect(opt.label.length).toBeGreaterThan(0);
    }
  });

  it("labels start with (UTC", () => {
    const options = getTimezoneOptions();
    for (const opt of options) {
      expect(opt.label).toMatch(/^\(UTC[+-]\d{2}:\d{2}\)/);
    }
  });

  it("values are valid IANA timezone strings", () => {
    const options = getTimezoneOptions();
    const iana = new Set(Intl.supportedValuesOf("timeZone"));
    for (const opt of options) {
      expect(iana.has(opt.value)).toBe(true);
    }
  });

  it("is sorted by UTC offset (ascending)", () => {
    const options = getTimezoneOptions();
    // Extract offset from label for comparison
    const offsets = options.map((opt) => {
      const match = opt.label.match(/\(UTC([+-])(\d{2}):(\d{2})\)/);
      if (!match) return 0;
      const sign = match[1] === "+" ? 1 : -1;
      return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
    });

    for (let i = 1; i < offsets.length; i++) {
      expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1]);
    }
  });

  it("contains common timezones", () => {
    const options = getTimezoneOptions();
    const values = options.map((o) => o.value);
    expect(values).toContain("Europe/Paris");
    expect(values).toContain("America/New_York");
    expect(values).toContain("Asia/Tokyo");
  });
});

describe("formatTimezoneDisplay", () => {
  it("formats Europe/Paris with UTC offset", () => {
    const result = formatTimezoneDisplay("Europe/Paris");
    expect(result).toMatch(/^\(UTC[+-]\d{2}:\d{2}\) Europe\/Paris$/);
  });

  it("formats UTC as (UTC+00:00) UTC", () => {
    const result = formatTimezoneDisplay("UTC");
    expect(result).toBe("(UTC+00:00) UTC");
  });

  it("replaces underscores with spaces", () => {
    const result = formatTimezoneDisplay("America/New_York");
    expect(result).toContain("America/New York");
  });

  it("returns the raw string for invalid timezone", () => {
    const result = formatTimezoneDisplay("Invalid/Zone");
    expect(result).toBe("Invalid/Zone");
  });
});
