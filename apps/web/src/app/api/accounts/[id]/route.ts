import { AccountType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function normalizeAccountType(value: unknown) {
  const raw = String(value ?? "CASH").trim().toUpperCase();
  return Object.values(AccountType).includes(raw as AccountType)
    ? (raw as AccountType)
    : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.account.findFirst({
    where: { id, userId: user.id, isArchived: false },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const broker = body.broker ? String(body.broker).trim() : null;
    const currency = String(body.currency ?? "USD").trim().toUpperCase();
    const accountType = normalizeAccountType(body.accountType);

    if (!name) {
      return NextResponse.json({ error: "Account name is required" }, { status: 400 });
    }

    if (currency.length !== 3) {
      return NextResponse.json({ error: "Currency must use a 3-letter code" }, { status: 400 });
    }

    if (!accountType) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "You already have an account with this name" }, { status: 409 });
    }

    try {
      const account = await prisma.account.update({
        where: { id },
        data: {
          name,
          broker,
          currency,
          accountType,
        },
      });

      return NextResponse.json({ account });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ error: "You already have an account with this name" }, { status: 409 });
      }

      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request payload" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.account.findFirst({
    where: { id, userId: user.id, isArchived: false },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await prisma.account.update({
    where: { id },
    data: { isArchived: true },
  });

  return new NextResponse(null, { status: 204 });
}
