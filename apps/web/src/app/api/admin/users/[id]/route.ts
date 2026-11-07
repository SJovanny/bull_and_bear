import { z } from "zod";

import { safeErrorResponse, safeParseJson } from "@/lib/api";
import { grantSchema, grantToUserData, withAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const patchSchema = z
  .object({
    grant: grantSchema.optional(),
    isAdmin: z.boolean().optional(),
  })
  .refine((v) => v.grant !== undefined || v.isAdmin !== undefined, { message: "Nothing to update" });

// ─── PATCH /api/admin/users/:id ─ offer / revoke subscription, toggle admin ──

export const PATCH = withAdmin(async (request, { user, params }) => {
  const id = params.id;
  if (!id) return safeErrorResponse("Missing user id", 400);

  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return safeErrorResponse("Invalid request body", 400);

  const { grant, isAdmin } = parsed.data;

  if (isAdmin === false && id === user.id) {
    return safeErrorResponse("You cannot remove your own admin rights", 400);
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, trialEndsAt: true, subscriptionStatus: true, subscriptionId: true },
  });
  if (!target) return safeErrorResponse("User not found", 404);

  // Never overwrite a real paying Stripe subscription — Stripe webhooks own that state.
  if (grant && target.subscriptionId && target.subscriptionStatus === "ACTIVE") {
    return safeErrorResponse(
      "This user has an active Stripe subscription. Manage it from Stripe.",
      409,
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(grant
        ? grantToUserData(
            grant,
            new Date(),
            target.subscriptionStatus === "TRIALING" ? target.trialEndsAt : null,
          )
        : {}),
      ...(isAdmin !== undefined ? { isAdmin } : {}),
    },
    select: { id: true, isAdmin: true, subscriptionStatus: true, trialEndsAt: true },
  });

  return Response.json({ user: updated });
});

// ─── DELETE /api/admin/users/:id ─ delete a user and all their data ──────────

export const DELETE = withAdmin(async (_request, { user, params }) => {
  const id = params.id;
  if (!id) return safeErrorResponse("Missing user id", 400);
  if (id === user.id) return safeErrorResponse("You cannot delete your own account here", 400);

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, isAdmin: true } });
  if (!target) return safeErrorResponse("User not found", 404);
  if (target.isAdmin) return safeErrorResponse("Remove admin rights before deleting this user", 400);

  await prisma.user.delete({ where: { id } });

  try {
    await createSupabaseAdminClient().auth.admin.deleteUser(id);
  } catch (err) {
    console.error("[DELETE /api/admin/users] Supabase auth deletion failed:", err);
  }

  return Response.json({ deleted: true });
});
