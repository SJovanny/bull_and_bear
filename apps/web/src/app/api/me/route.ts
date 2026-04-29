import { z } from "zod";

import { safeErrorResponse, safeParseJson, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const GET = withAuth(async (_request, { user }) => {
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  // Only return safe fields — never expose stripeCustomerId or subscriptionId
  const safeUser = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    language: user.language,
    timezone: user.timezone,
    createdAt: user.createdAt,
    isAdmin: user.isAdmin,
    subscriptionStatus: user.subscriptionStatus,
    trialEndsAt: user.trialEndsAt,
    currentPeriodEnd: user.currentPeriodEnd,
    hasStripeAccount: !!user.stripeCustomerId,
    hasSubscription: !!user.subscriptionId,
    importantNotes: user.importantNotes,
  };

  return Response.json({ user: safeUser, accounts });
}, { skipSubscriptionCheck: true });

const profileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  language: z.enum(["fr", "en"]).optional(),
  timezone: z.string().max(100).optional(),
});

export const PATCH = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const { displayName, firstName, lastName, country, language, timezone } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(displayName !== undefined && { displayName: displayName.trim() || null }),
      ...(firstName !== undefined && { firstName: firstName.trim() || null }),
      ...(lastName !== undefined && { lastName: lastName.trim() || null }),
      ...(country !== undefined && { country }),
      ...(language !== undefined && { language }),
      ...(timezone !== undefined && { timezone }),
    },
  });

  return Response.json({
    user: {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      timezone: updated.timezone,
      createdAt: updated.createdAt,
    },
  });
}, { skipSubscriptionCheck: true });

// ─── DELETE /api/me ─ Right to erasure (GDPR Art. 17) ────────────────────────

export const DELETE = withAuth(async (_request, { user }) => {
  // 1. Delete the user row in our DB (cascades to accounts, trades, journals)
  await prisma.user.delete({ where: { id: user.id } });

  // 2. Delete the user from Supabase Auth
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  } catch (err) {
    // DB data is already gone — log but don't block the response
    console.error("[DELETE /api/me] Supabase auth deletion failed:", err);
  }

  return Response.json({ deleted: true });
}, { skipSubscriptionCheck: true });
