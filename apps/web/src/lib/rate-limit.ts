import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Types ──────────────────────────────────────────────────────────────────

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

// ─── Configuration ──────────────────────────────────────────────────────────

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth") || pathname.includes("/auth/");
}

function isStatsPath(pathname: string): boolean {
  return pathname.startsWith("/api/stats");
}

// ─── Redis-backed rate limiters (shared across all instances) ───────────────
//
// Upstash Redis provides a globally consistent rate limiter that works
// correctly in serverless / multi-instance deployments (e.g. Vercel).
//
// We create separate limiters with different windows and limits:
//  - Auth routes:  10 requests per 60 s  (protects against credential stuffing)
//  - Stats routes: 30 requests per 60 s  (expensive queries)
//  - General API:  60 requests per 60 s  (standard CRUD operations)
//
// If UPSTASH_REDIS_REST_URL is not configured, we fall back to an in-memory
// limiter so that local development works without Redis.
// ────────────────────────────────────────────────────────────────────────────

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

function createUpstashLimiter(maxRequests: number, window: string) {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(maxRequests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    analytics: true,
    prefix: "rl",
  });
}

const authLimiter = hasUpstash ? createUpstashLimiter(10, "60 s") : null;
const statsLimiter = hasUpstash ? createUpstashLimiter(30, "60 s") : null;
const apiLimiter = hasUpstash ? createUpstashLimiter(60, "60 s") : null;

// ─── In-memory fallback (dev / environments without Upstash) ────────────────

type MemoryBucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, MemoryBucket>();
const RATE_WINDOW_MS = 60_000;

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
 * Check rate limit for a request.
 *
 * When Upstash Redis is configured (UPSTASH_REDIS_REST_URL + TOKEN),
 * limits are enforced globally via a sliding-window algorithm backed by
 * Redis — consistent across all Vercel function instances.
 *
 * Limits:
 *  - Auth routes  (/api/auth*, /auth/*):  10 req / 60 s
 *  - Stats routes (/api/stats/*):         30 req / 60 s
 *  - All other API routes:                60 req / 60 s
 *
 * Falls back to in-memory per-instance limiting when Redis is unavailable.
 */
export async function checkRateLimit(
  ip: string,
  pathname: string,
): Promise<RateLimitResult> {
  const isAuth = isAuthPath(pathname);
  const isStats = isStatsPath(pathname);

  const prefix = pathname.split("/").slice(0, 4).join("/");
  const identifier = `${ip}:${prefix}`;

  // ── Upstash path ──────────────────────────────────────────────────────
  const limiter = isAuth ? authLimiter : isStats ? statsLimiter : apiLimiter;

  if (limiter) {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // ── Fallback: in-memory (dev only) ────────────────────────────────────
  const limit = isAuth ? 10 : isStats ? 30 : 60;
  return memoryRateLimit(identifier, limit);
}
