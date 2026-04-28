/**
 * Build a list of IANA timezones with their UTC offset labels,
 * sorted by offset then alphabetically.
 *
 * Example entry: { value: "Europe/Paris", label: "(UTC+01:00) Europe/Paris" }
 */
export function getTimezoneOptions(): Array<{ value: string; label: string }> {
  const now = Date.now();

  const options = Intl.supportedValuesOf("timeZone").map((tz) => {
    // Get the UTC offset in minutes for this timezone right now
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";

    // Parse the offset string (e.g. "GMT+1", "GMT-5:30", "GMT") into minutes
    const offsetMinutes = parseOffsetToMinutes(offsetPart);

    // Format as "(UTC+01:00)" or "(UTC-05:30)"
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(offsetMinutes);
    const hours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
    const mins = String(absMinutes % 60).padStart(2, "0");
    const label = `(UTC${sign}${hours}:${mins}) ${tz.replace(/_/g, " ")}`;

    return { value: tz, label, offsetMinutes };
  });

  // Sort by offset first, then alphabetically by timezone name
  options.sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.value.localeCompare(b.value));

  return options.map(({ value, label }) => ({ value, label }));
}

function parseOffsetToMinutes(offset: string): number {
  // offset looks like "GMT", "GMT+1", "GMT-5:30", "GMT+5:45"
  if (offset === "GMT" || offset === "UTC") return 0;

  const match = offset.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;

  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;

  return sign * (hours * 60 + minutes);
}

/**
 * Format a stored IANA timezone for display, e.g. "(UTC+01:00) Europe/Paris"
 */
export function formatTimezoneDisplay(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(Date.now());
    const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";

    const offsetMinutes = parseOffsetToMinutes(offsetPart);
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(offsetMinutes);
    const hours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
    const mins = String(absMinutes % 60).padStart(2, "0");

    return `(UTC${sign}${hours}:${mins}) ${tz.replace(/_/g, " ")}`;
  } catch {
    return tz;
  }
}
