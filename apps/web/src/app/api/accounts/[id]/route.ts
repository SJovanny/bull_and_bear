import { Prisma } from "@prisma/client";

import { safeErrorResponse, withAuth } from "@/lib/api";
import { accountUpdateSchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";

export const PATCH = withAuth(async (request, { user, params }) => {
  const { id } = params;

  const existing = await prisma.account.findFirst({
    where: { id, userId: user.id, isArchived: false },
    select: { id: true },
  });

  if (!existing) {
    return safeErrorResponse("Account not found", 404);
  }

  const body = await request.json();
  const parsedBody = accountUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const { name, broker, currency, accountType, initialBalance } = parsedBody.data;

  const duplicate = await prisma.account.findFirst({
    where: {
      userId: user.id,
      isArchived: false,
      name,
      id: { not: id },
    },
    select: { id: true },
  });

  if (duplicate) {
    return safeErrorResponse("You already have an account with this name", 409);
  }

  try {
    const account = await prisma.account.update({
      where: { id, userId: user.id },
      data: { name, broker, currency, accountType, ...(initialBalance !== undefined && { initialBalance }) },
    });

    return Response.json({ account });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return safeErrorResponse("You already have an account with this name", 409);
    }

    throw error;
  }
});

export const DELETE = withAuth(async (_request, { user, params }) => {
  const { id } = params;

  const existing = await prisma.account.findFirst({
    where: { id, userId: user.id, isArchived: false },
    select: { id: true },
  });

  if (!existing) {
    return safeErrorResponse("Account not found", 404);
  }

  await prisma.account.update({
    where: { id, userId: user.id },
    data: { isArchived: true },
  });

  return new Response(null, { status: 204 });
});
