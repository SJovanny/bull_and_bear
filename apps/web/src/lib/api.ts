import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Types ──────────────────────────────────────────────────────────────────

type AppUser = Awaited<ReturnType<typeof getCurrentAppUser>>;

export type AuthenticatedUser = NonNullable<AppUser>;

export type AuthenticatedContext = {
  user: AuthenticatedUser;
};

export type AuthenticatedHandler = (
  request: Request,
  ctx: AuthenticatedContext & { params: Record<string, string> },
) => Promise<Response>;

// ─── Safe Error Response ────────────────────────────────────────────────────

/**
 * Returns a sanitised JSON error response.
 * NEVER leaks internal error messages (e.g. Prisma table names).
 */
export function safeErrorResponse(
  fallbackMessage: string,
  status: number = 500,
  _error?: unknown,
): Response {
  if (_error) {
    console.error(`[API Error] ${fallbackMessage}:`, _error);
  }

  return NextResponse.json({ error: fallbackMessage }, { status });
}

// ─── Account Ownership Verification ─────────────────────────────────────────

/**
 * Verifies that the given accountId belongs to the authenticated user.
 * Returns the account if valid, null otherwise.
 */
export async function verifyAccountOwnership(
  accountId: string,
  userId: string,
) {
  return prisma.account.findFirst({
    where: { id: accountId, userId, isArchived: false },
    select: { id: true },
  });
}

// ─── Authenticated Route Wrapper ────────────────────────────────────────────

/**
 * Wraps an API route handler with:
 * 1. Rate limiting (in-memory sliding window)
 * 2. Authentication check
 * 3. Centralised error handling (no internal leaks)
 *
 * Usage:
 *   export const GET = withAuth(async (request, { user, params }) => { ... });
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    request: Request,
    context?: { params?: Promise<Record<string, string>> },
  ) => {
    try {
      // 1. Rate limiting
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const pathname = new URL(request.url).pathname;
      const rl = await checkRateLimit(ip, pathname);

      if (!rl.success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
              "X-RateLimit-Limit": String(rl.limit),
              "X-RateLimit-Remaining": String(rl.remaining),
              "X-RateLimit-Reset": String(rl.reset),
            },
          },
        );
      }

      // 2. Authentication
      const user = await getCurrentAppUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // 3. Resolve dynamic params
      const params = context?.params ? await context.params : {};

      // 4. Execute handler
      return await handler(request, { user, params });
    } catch (error) {
      return safeErrorResponse("An unexpected error occurred", 500, error);
    }
  };
}
