import { timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";
import {
  getLocalDateHour,
  isPushConfigured,
  reminderCopy,
  sendPushToSubscription,
} from "@/lib/push";
import { hasActiveAccess } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Skip devices already notified within this window (protects against cron retries).
const MIN_RESEND_MS = 20 * 60 * 60 * 1000;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// The cron runs once a day (Vercel Hobby plan). Users whose local time is
// outside this window are skipped so nobody is notified in the middle of the night.
const LOCAL_HOUR_MIN = 12;
const LOCAL_HOUR_MAX = 23;

/**
 * Daily cron. Sends a push notification to every device of each user who has
 * reminders enabled and no journal entry yet for their local day.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return Response.json({ error: "Push notifications are not configured" }, { status: 503 });
  }

  const now = new Date();
  const users = await prisma.user.findMany({
    where: { journalReminderEnabled: true, pushSubscriptions: { some: {} } },
    select: {
      id: true,
      language: true,
      timezone: true,
      isAdmin: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      pushSubscriptions: true,
    },
  });

  let notifiedUsers = 0;
  let sent = 0;

  for (const user of users) {
    const { date, hour } = getLocalDateHour(now, user.timezone);
    if (hour < LOCAL_HOUR_MIN || hour > LOCAL_HOUR_MAX) continue;
    if (!user.isAdmin && !hasActiveAccess(user.subscriptionStatus, user.trialEndsAt)) continue;

    // Journals are stored at UTC midnight of the chosen calendar day.
    const alreadyJournaled = await prisma.dailyJournal.findFirst({
      where: { userId: user.id, date: new Date(`${date}T00:00:00.000Z`) },
      select: { id: true },
    });
    if (alreadyJournaled) continue;

    const copy = user.language === "en" ? reminderCopy.en : reminderCopy.fr;
    const due = user.pushSubscriptions.filter(
      (s) => !s.lastSentAt || now.getTime() - s.lastSentAt.getTime() > MIN_RESEND_MS,
    );

    let delivered = 0;
    for (const sub of due) {
      const ok = await sendPushToSubscription(sub, { ...copy, url: "/journal", tag: "journal-reminder" });
      if (ok) {
        delivered++;
        await prisma.pushSubscription
          .update({ where: { id: sub.id }, data: { lastSentAt: now } })
          .catch(() => {});
      }
    }

    if (delivered > 0) {
      notifiedUsers++;
      sent += delivered;
    }
  }

  return Response.json({ candidates: users.length, notifiedUsers, sent });
}
