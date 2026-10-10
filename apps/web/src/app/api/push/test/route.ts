import { safeErrorResponse, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isPushConfigured, reminderCopy, sendPushToSubscription } from "@/lib/push";

/** Sends the reminder notification to the current user's devices right now. */
export const POST = withAuth(async (_request, { user }) => {
  if (!isPushConfigured()) return safeErrorResponse("Push notifications are not configured", 503);

  const subs = await prisma.pushSubscription.findMany({ where: { userId: user.id } });
  if (subs.length === 0) return safeErrorResponse("No subscribed device", 404);

  const copy = user.language === "en" ? reminderCopy.en : reminderCopy.fr;
  const results = await Promise.all(
    subs.map((sub) => sendPushToSubscription(sub, { ...copy, url: "/journal", tag: "journal-test" })),
  );

  return Response.json({ sent: results.filter(Boolean).length });
}, { skipSubscriptionCheck: true });
