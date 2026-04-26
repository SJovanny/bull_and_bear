import { z } from "zod";

import { safeErrorResponse, safeParseJson, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const GET = withAuth(async (_request, { user }) => {
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ user, accounts });
});

const profileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  timezone: z.string().max(100).optional(),
});

export const PATCH = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const { displayName, timezone } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(displayName !== undefined && { displayName: displayName.trim() || null }),
      ...(timezone !== undefined && { timezone }),
    },
  });

  return Response.json({ user: updated });
});

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
});
