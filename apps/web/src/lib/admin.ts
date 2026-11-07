import { NextResponse } from "next/server";
import { withAuth, type AuthenticatedHandler } from "@/lib/api";

export { grantSchema, grantToUserData, type Grant } from "@/lib/admin-grants";

/**
 * Wraps an API route so only users with `isAdmin = true` can call it.
 * Builds on `withAuth` (rate limit, CSRF origin check, auth) and skips the
 * paywall check, since admins bypass it anyway.
 */
export function withAdmin(handler: AuthenticatedHandler) {
  return withAuth(
    async (request, ctx) => {
      if (!ctx.user.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return handler(request, ctx);
    },
    { skipSubscriptionCheck: true },
  );
}
