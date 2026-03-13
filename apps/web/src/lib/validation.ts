/**
 * Centralised parsing & validation helpers used across API routes.
 * Eliminates duplicated copies of parseDecimal / parseNullableBoolean / ASSET_CLASSES.
 */

export const ASSET_CLASSES = [
  "STOCK",
  "FUTURES",
  "FOREX",
  "CRYPTO",
  "OPTIONS",
  "ETF",
  "INDEX",
  "CFD",
  "OTHER",
] as const;

export type AssetClassValue = (typeof ASSET_CLASSES)[number];

export function parseDecimal(value: unknown, fieldName: string): number {
  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}`);
  }

  return parsed;
}

export function parseNullableBoolean(value: unknown): boolean | null {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

/**
 * Validates that a `next` redirect path is safe (relative, same-origin).
 * Prevents open-redirect attacks via crafted `?next=https://evil.com`.
 */
export function sanitizeRedirectPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;

  const trimmed = raw.trim();

  // Must start with "/" and must NOT start with "//" (protocol-relative URL)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // Block any embedded protocol (e.g. "/\evil.com" or any scheme)
  try {
    const url = new URL(trimmed, "http://localhost");
    if (url.hostname !== "localhost") {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return trimmed;
}

/** Maximum total size in bytes for chart screenshots (base64-encoded). 10 MB. */
export const MAX_SCREENSHOTS_TOTAL_BYTES = 10 * 1024 * 1024;

/** Maximum number of chart screenshots per trade. */
export const MAX_SCREENSHOTS_COUNT = 10;

/** Maximum string field length for short text inputs. */
export const MAX_SHORT_TEXT = 500;

/** Maximum string field length for long text inputs (notes, reasons). */
export const MAX_LONG_TEXT = 5000;

/**
 * Trims a string and enforces a max-length limit.
 * Returns null when the result is empty.
 */
export function sanitizeString(
  value: unknown,
  maxLength = MAX_SHORT_TEXT,
): string | null {
  if (value == null || value === "") return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/**
 * Validates base64 chart screenshots.
 * Returns a sanitised array or throws if limits are exceeded.
 */
export function validateScreenshots(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  if (raw.length > MAX_SCREENSHOTS_COUNT) {
    throw new Error(`Maximum ${MAX_SCREENSHOTS_COUNT} screenshots allowed`);
  }

  const screenshots: string[] = [];
  let totalBytes = 0;

  for (const item of raw) {
    if (typeof item !== "string") {
      throw new Error("Each screenshot must be a string");
    }

    // Validate data-URL prefix
    if (!item.startsWith("data:image/")) {
      throw new Error("Screenshots must be data:image/* URLs");
    }

    totalBytes += item.length;
    if (totalBytes > MAX_SCREENSHOTS_TOTAL_BYTES) {
      throw new Error(
        `Total screenshot size exceeds ${MAX_SCREENSHOTS_TOTAL_BYTES / (1024 * 1024)} MB`,
      );
    }

    screenshots.push(item);
  }

  return screenshots.length > 0 ? screenshots : null;
}
