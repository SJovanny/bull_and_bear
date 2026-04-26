import { safeErrorResponse, verifyAccountOwnership, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const cursor = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");

  if (!accountId) {
    return safeErrorResponse("accountId is required", 400);
  }

  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const take = Math.min(
    Math.max(1, Number(limitParam) || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );

  const journals = await prisma.dailyJournal.findMany({
    where: { accountId, userId: user.id },
    orderBy: { date: "desc" },
    take: take + 1, // fetch one extra to detect next page
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = journals.length > take;
  const items = hasMore ? journals.slice(0, take) : journals;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return Response.json({ journals: items, nextCursor, hasMore });
});
