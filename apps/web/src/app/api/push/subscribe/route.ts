import { z } from "zod";

import { safeErrorResponse, safeParseJson, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isPushConfigured } from "@/lib/push";

const subscribeSchema = z.object({
  endpoint: z.url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
});

const unsubscribeSchema = z.object({ endpoint: z.url().max(2048) });

export const POST = withAuth(async (request, { user }) => {
  if (!isPushConfigured()) return safeErrorResponse("Push notifications are not configured", 503);

  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return safeErrorResponse("Invalid request body", 400);

  const { endpoint, keys } = parsed.data;
  const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? null;

  // The endpoint is unique per browser install; re-assign it if another user
  // previously signed in on the same device.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth, userAgent },
  });

  return Response.json({ subscribed: true });
}, { skipSubscriptionCheck: true });

export const DELETE = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) return safeErrorResponse("Invalid request body", 400);

  await prisma.pushSubscription.deleteMany({
    where: { endpoint: parsed.data.endpoint, userId: user.id },
  });

  return Response.json({ subscribed: false });
}, { skipSubscriptionCheck: true });
