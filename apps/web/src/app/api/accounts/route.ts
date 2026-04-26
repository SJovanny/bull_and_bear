import { Prisma } from "@prisma/client";

import { safeErrorResponse, safeParseJson, withAuth } from "@/lib/api";
import { accountCreateSchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (_request, { user }) => {
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { trades: true } } },
  });

  return Response.json({ accounts });
});

export const POST = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsedBody = accountCreateSchema.safeParse(body);

  if (!parsedBody.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const { name, broker, currency, accountType, initialBalance } = parsedBody.data;

  try {
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        name,
        broker,
        currency,
        accountType,
        initialBalance,
      },
    });

    return Response.json({ account }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return safeErrorResponse("You already have an account with this name", 409);
    }

    throw error;
  }
});
