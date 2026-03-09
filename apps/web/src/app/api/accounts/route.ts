import { AccountType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const broker = body.broker ? String(body.broker).trim() : null;
  const currency = String(body.currency ?? "USD").trim().toUpperCase();
  const accountTypeRaw = String(body.accountType ?? "CASH").toUpperCase();

  if (!name) {
    return NextResponse.json({ error: "Account name is required" }, { status: 400 });
  }

  const accountType = Object.values(AccountType).includes(accountTypeRaw as AccountType)
    ? (accountTypeRaw as AccountType)
    : AccountType.CASH;

  try {
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        name,
        broker,
        currency,
        accountType,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "You already have an account with this name" }, { status: 409 });
    }

    throw error;
  }
}
