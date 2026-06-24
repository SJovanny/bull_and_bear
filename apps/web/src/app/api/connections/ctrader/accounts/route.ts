/**
 * POST /api/connections/ctrader/accounts
 *
 * Called when the user has multiple cTrader accounts and needs to pick one.
 * Receives the encoded payload from the OAuth callback redirect and the
 * chosen ctidTraderAccountId, then persists the BrokerConnection.
 *
 * GET /api/connections/ctrader/accounts
 *
 * Returns the current BrokerConnection for a given accountId (if any).
 */

import { NextResponse } from "next/server";

import { safeErrorResponse, safeParseJson, verifyAccountOwnership, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const linkSchema = z.object({
  accountId: z.string().uuid(),
  /** base64url-encoded payload from the OAuth callback redirect */
  payload: z.string().min(1),
  /** The ctidTraderAccountId the user selected */
  ctidTraderAccountId: z.string().min(1),
});

type OAuthPayload = {
  accountId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  accounts: Array<{
    ctidTraderAccountId: string;
    isLive: boolean;
    brokerTitle?: string;
    traderLogin?: string;
  }>;
};

// POST – link a selected cTrader account
export const POST = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  const { accountId, payload: encodedPayload, ctidTraderAccountId } = parsed.data;

  // Verify account ownership
  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  // Decode the OAuth payload
  let oauthData: OAuthPayload;
  try {
    oauthData = JSON.parse(Buffer.from(encodedPayload, "base64url").toString()) as OAuthPayload;
  } catch {
    return safeErrorResponse("Invalid OAuth payload", 400);
  }

  // Ensure the payload belongs to this account
  if (oauthData.accountId !== accountId) {
    return safeErrorResponse("Account mismatch", 400);
  }

  // Find the selected cTrader account
  const selected = oauthData.accounts.find(
    (a) => a.ctidTraderAccountId === ctidTraderAccountId,
  );
  if (!selected) {
    return safeErrorResponse("Selected cTrader account not found in payload", 400);
  }

  const tokenExpiresAt = new Date(oauthData.tokenExpiresAt);
  if (isNaN(tokenExpiresAt.getTime())) {
    return safeErrorResponse("Invalid token expiry in payload", 400);
  }

  try {
    const connection = await prisma.brokerConnection.upsert({
      where: { accountId },
      create: {
        userId: user.id,
        accountId,
        provider: "CTRADER",
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken,
        tokenExpiresAt,
        ctidTraderAccountId: selected.ctidTraderAccountId,
        isLive: selected.isLive,
        syncStatus: "IDLE",
      },
      update: {
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken,
        tokenExpiresAt,
        ctidTraderAccountId: selected.ctidTraderAccountId,
        isLive: selected.isLive,
        syncStatus: "IDLE",
        syncError: null,
      },
    });

    return NextResponse.json({
      connection: {
        id: connection.id,
        provider: connection.provider,
        ctidTraderAccountId: connection.ctidTraderAccountId,
        isLive: connection.isLive,
        lastSyncAt: connection.lastSyncAt,
        syncStatus: connection.syncStatus,
      },
    });
  } catch (err) {
    return safeErrorResponse("Could not save broker connection", 500, err);
  }
});

// GET – fetch connection status for a given accountId
export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return safeErrorResponse("accountId is required", 400);
  }

  // Verify account ownership
  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return safeErrorResponse("Account not found", 404);
  }

  const connection = await prisma.brokerConnection.findUnique({
    where: { accountId },
    select: {
      id: true,
      provider: true,
      ctidTraderAccountId: true,
      isLive: true,
      lastSyncAt: true,
      syncStatus: true,
      syncError: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ connection: connection ?? null });
});
