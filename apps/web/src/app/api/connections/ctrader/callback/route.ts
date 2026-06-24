/**
 * GET /api/connections/ctrader/callback
 *
 * cTrader OAuth callback.  cTrader redirects here with ?code=…&state=…
 *
 * Flow:
 *  1. Exchange code for access + refresh tokens (REST call to cTrader)
 *  2. Use the WebSocket API to list trading accounts for that token
 *  3. Redirect the user back to /comptes with the accounts list encoded in the
 *     URL so the UI can ask them which cTrader account to link
 *
 * The actual BrokerConnection record is created in a second step via
 * POST /api/connections/ctrader/accounts (after the user picks an account).
 */

import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import {
  exchangeCodeForTokens,
  listCTraderAccounts,
  type CTraderCredentials,
} from "@/lib/ctrader-api";
import { prisma } from "@/lib/prisma";

const CTRADER_CLIENT_ID = process.env.CTRADER_CLIENT_ID ?? "";
const CTRADER_CLIENT_SECRET = process.env.CTRADER_CLIENT_SECRET ?? "";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // cTrader returns ?error=access_denied if the user cancels
  if (errorParam) {
    return NextResponse.redirect(`${APP_URL}/comptes?ctrader_error=cancelled`);
  }

  if (!code || !stateRaw) {
    return NextResponse.redirect(`${APP_URL}/comptes?ctrader_error=missing_params`);
  }

  // Decode state (base64url JSON with accountId)
  let accountId: string;
  try {
    const decoded = JSON.parse(Buffer.from(stateRaw, "base64url").toString()) as {
      accountId?: string;
    };
    if (!decoded.accountId) throw new Error("missing accountId");
    accountId = decoded.accountId;
  } catch {
    return NextResponse.redirect(`${APP_URL}/comptes?ctrader_error=invalid_state`);
  }

  // Auth check (callback is not behind withAuth since it's a redirect target)
  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.redirect(`${APP_URL}/auth/login`);
  }

  // Verify account belongs to user
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id, isArchived: false },
    select: { id: true },
  });
  if (!account) {
    return NextResponse.redirect(`${APP_URL}/comptes?ctrader_error=account_not_found`);
  }

  if (!CTRADER_CLIENT_ID || !CTRADER_CLIENT_SECRET) {
    return NextResponse.redirect(`${APP_URL}/comptes?ctrader_error=not_configured`);
  }

  const credentials: CTraderCredentials = {
    clientId: CTRADER_CLIENT_ID,
    clientSecret: CTRADER_CLIENT_SECRET,
  };
  const redirectUri = `${APP_URL}/api/connections/ctrader/callback`;

  try {
    // 1. Exchange code for tokens
    const { accessToken, refreshToken, expiresInSeconds } = await exchangeCodeForTokens(
      code,
      redirectUri,
      credentials,
    );

    // 2. List cTrader accounts available for this token
    const ctraderAccounts = await listCTraderAccounts(accessToken, credentials);

    // 3. Store tokens temporarily in the DB (keyed by accountId) so the
    //    /api/connections/ctrader/accounts route can create the connection.
    //    We store them on the BrokerConnection directly if only one account,
    //    otherwise we need the user to pick.
    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    if (ctraderAccounts.length === 1) {
      // Only one cTrader account – auto-link it
      const ct = ctraderAccounts[0];
      await prisma.brokerConnection.upsert({
        where: { accountId },
        create: {
          userId: user.id,
          accountId,
          provider: "CTRADER",
          accessToken,
          refreshToken,
          tokenExpiresAt,
          ctidTraderAccountId: String(ct.ctidTraderAccountId),
          isLive: ct.isLive,
          syncStatus: "IDLE",
        },
        update: {
          accessToken,
          refreshToken,
          tokenExpiresAt,
          ctidTraderAccountId: String(ct.ctidTraderAccountId),
          isLive: ct.isLive,
          syncStatus: "IDLE",
          syncError: null,
        },
      });

      return NextResponse.redirect(`${APP_URL}/comptes?ctrader_success=linked`);
    }

    // Multiple accounts: pass serialized data back to UI for account selection
    // We encode tokens + accounts list into a short-lived session-like structure.
    // For simplicity we pass the necessary data in the redirect URL (base64).
    // In production, prefer a server-side session (e.g., Supabase edge function
    // or an encrypted cookie).
    const payload = Buffer.from(
      JSON.stringify({
        accountId,
        accessToken,
        refreshToken,
        tokenExpiresAt: tokenExpiresAt.toISOString(),
        accounts: ctraderAccounts.map((a) => ({
          ctidTraderAccountId: String(a.ctidTraderAccountId),
          isLive: a.isLive,
          brokerTitle: a.brokerTitle,
          traderLogin: a.traderLogin,
        })),
      }),
    ).toString("base64url");

    return NextResponse.redirect(
      `${APP_URL}/comptes?ctrader_select=${payload}`,
    );
  } catch (err) {
    console.error("[cTrader OAuth callback]", err);
    return NextResponse.redirect(`${APP_URL}/comptes?ctrader_error=token_exchange_failed`);
  }
}
