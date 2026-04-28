import "server-only";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Extract profile fields from Supabase user metadata.
 * Pure function — easy to unit-test without a database.
 */
export function extractProfileFields(email: string, meta: Record<string, unknown>) {
  const displayName =
    (meta.full_name as string) ?? (meta.name as string) ?? email.split("@")[0];

  return {
    displayName,
    firstName: (meta.first_name as string) ?? null,
    lastName: (meta.last_name as string) ?? null,
    country: (meta.country as string) ?? null,
    language: (meta.language as string) ?? "fr",
    timezone: (meta.timezone as string) ?? "UTC",
  };
}

/**
 * Build the Prisma `update` payload — only includes metadata fields that are
 * present (truthy), so we never overwrite existing values with null on
 * subsequent logins (e.g. Google OAuth where metadata may be sparse).
 */
export function buildUpdatePayload(email: string, meta: Record<string, unknown>) {
  const displayName =
    (meta.full_name as string) ?? (meta.name as string) ?? email.split("@")[0];

  return {
    email,
    displayName,
    ...(meta.first_name ? { firstName: meta.first_name as string } : {}),
    ...(meta.last_name ? { lastName: meta.last_name as string } : {}),
    ...(meta.country ? { country: meta.country as string } : {}),
    ...(meta.language ? { language: meta.language as string } : {}),
    ...(meta.timezone ? { timezone: meta.timezone as string } : {}),
  };
}

export async function syncUserFromAuth(user: SupabaseUser) {
  if (!user.email) {
    throw new Error("Authenticated user is missing an email.");
  }

  const meta = user.user_metadata ?? {};
  const profile = extractProfileFields(user.email, meta);
  const updatePayload = buildUpdatePayload(user.email, meta);

  return prisma.user.upsert({
    where: { id: user.id },
    update: updatePayload,
    create: {
      id: user.id,
      email: user.email,
      ...profile,
      subscriptionStatus: SubscriptionStatus.INACTIVE,
      trialEndsAt: null,
    },
  });
}
