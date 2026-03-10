// ─── Types ──────────────────────────────────────────────────────────────────

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

// ─── Configuration ──────────────────────────────────────────────────────────

const RATE_LIMIT_API = 60; // requests per minute
const RATE_LIMIT_AUTH = 10; // attempts per minute
const RATE_WINDOW_MS = 60_000;

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth") || pathname.includes("/auth/");
}

// ─── In-memory sliding window ───────────────────────────────────────────────

type MemoryBucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, MemoryBucket>();

// Clean up stale buckets every 5 minutes
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryBuckets) {
      if (now > bucket.resetAt) memoryBuckets.delete(key);
    }
  }, 5 * 60_000).unref?.();
}

function memoryRateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  let bucket = memoryBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    memoryBuckets.set(key, bucket);
  }

  bucket.count++;

  return {
    success: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    reset: bucket.resetAt,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Check rate limit for a request using an in-memory sliding window.
 *
 * Limits:
 *  - Auth routes (/api/auth*, /auth/*): 10 requests per minute
 *  - All other API routes: 60 requests per minute
 *
 * Note: In a serverless environment (e.g. Vercel), each function instance
 * maintains its own bucket map, so limits are per-instance rather than global.
 * This still provides meaningful burst-abuse protection per instance.
 */
export async function checkRateLimit(
  ip: string,
  pathname: string,
): Promise<RateLimitResult> {
  const isAuth = isAuthPath(pathname);
  const limit = isAuth ? RATE_LIMIT_AUTH : RATE_LIMIT_API;
  const prefix = pathname.split("/").slice(0, 4).join("/");
  const identifier = `${ip}:${prefix}`;

  return memoryRateLimit(identifier, limit);
}
