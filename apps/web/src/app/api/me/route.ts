import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (_request, { user }) => {
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ user, accounts });
});
