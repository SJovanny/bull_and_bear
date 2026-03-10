import { safeErrorResponse, verifyAccountOwnership, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return safeErrorResponse("accountId is required", 400);
  }

  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const journals = await prisma.dailyJournal.findMany({
    where: { accountId, userId: user.id },
    orderBy: { date: "desc" },
  });

  return Response.json({ journals });
});
