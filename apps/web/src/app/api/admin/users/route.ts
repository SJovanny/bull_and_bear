import type { Prisma, SubscriptionStatus } from "@prisma/client";
import { z } from "zod";

import { safeErrorResponse, safeParseJson } from "@/lib/api";
import { grantSchema, grantToUserData, withAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 25;
const STATUSES = ["INACTIVE", "TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"] as const;

// ─── GET /api/admin/users ─ list + global stats ──────────────────────────────

export const GET = withAdmin(async (request) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const status = url.searchParams.get("status");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && (STATUSES as readonly string[]).includes(status)
      ? { subscriptionStatus: status as SubscriptionStatus }
      : {}),
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [users, filteredTotal, total, active, trialing, newThisWeek, admins] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        country: true,
        isAdmin: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        subscriptionId: true,
        createdAt: true,
        _count: { select: { trades: true, accounts: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.user.count({ where: { subscriptionStatus: "TRIALING", trialEndsAt: { gt: now } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { isAdmin: true } }),
  ]);

  return Response.json({
    users: users.map(({ stripeCustomerId, subscriptionId, ...u }) => ({
      ...u,
      // Paying via Stripe vs. granted by an admin
      hasStripeSubscription: !!subscriptionId,
      hasStripeAccount: !!stripeCustomerId,
    })),
    pagination: { page, pageSize: PAGE_SIZE, total: filteredTotal, pages: Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE)) },
    stats: { total, active, trialing, newThisWeek, admins },
  });
});

// ─── POST /api/admin/users ─ invite a user by email ──────────────────────────

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  /** Optional subscription offered at invitation time */
  grant: grantSchema.optional(),
});

export const POST = withAdmin(async (request) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return safeErrorResponse("Invalid request body", 400);

  const { email, firstName, lastName, grant } = parsed.data;

  const redirectBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const supabaseAdmin = createSupabaseAdminClient();

  const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
    },
    ...(redirectBase ? { redirectTo: `${redirectBase}/auth/callback` } : {}),
  });

  if (inviteError || !data.user) {
    const alreadyExists = /already.*(registered|exists)/i.test(inviteError?.message ?? "");
    return safeErrorResponse(
      alreadyExists ? "A user with this email already exists" : "Could not send invitation",
      alreadyExists ? 409 : 400,
      inviteError,
    );
  }

  // Create the app-side row right away so the grant is in place on first login.
  // (syncUserFromAuth never overwrites subscription fields on later logins.)
  const grantData = grant ? grantToUserData(grant) : {};
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];

  await prisma.user.upsert({
    where: { id: data.user.id },
    update: grantData,
    create: {
      id: data.user.id,
      email,
      displayName,
      firstName: firstName || null,
      lastName: lastName || null,
      ...grantData,
    },
  });

  return Response.json({ invited: true, userId: data.user.id }, { status: 201 });
});
