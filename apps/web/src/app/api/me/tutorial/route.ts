import { NextResponse } from "next/server";
import { safeParseJson, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// ─── GET /api/me/tutorial ───────────────────────────────────────────────────
// Returns the user's tutorial completion status
export const GET = withAuth(async (_request, { user }) => {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tutorialsCompleted: true },
  });

  return NextResponse.json({
    tutorialsCompleted: (dbUser?.tutorialsCompleted as Record<string, boolean>) ?? {},
  });
});

// ─── PATCH /api/me/tutorial ─────────────────────────────────────────────────
// Mark a tutorial as completed, or reset one/all tutorials
export const PATCH = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const { action, page } = body as { action: "complete" | "reset" | "resetAll"; page?: string };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tutorialsCompleted: true },
  });

  const current = (dbUser?.tutorialsCompleted as Record<string, boolean>) ?? {};

  let updated: Record<string, boolean>;

  switch (action) {
    case "complete":
      if (!page) {
        return NextResponse.json({ error: "Missing page" }, { status: 400 });
      }
      updated = { ...current, [page]: true };
      break;
    case "reset":
      if (!page) {
        return NextResponse.json({ error: "Missing page" }, { status: 400 });
      }
      updated = { ...current, [page]: false };
      break;
    case "resetAll":
      updated = {};
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { tutorialsCompleted: updated },
  });

  return NextResponse.json({ tutorialsCompleted: updated });
});
