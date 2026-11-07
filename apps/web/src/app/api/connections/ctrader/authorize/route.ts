/**
 * GET /api/connections/ctrader/authorize
 *
 * Returns the OAuth authorization URL that the client should redirect to.
 * Query params:
 *   accountId  – the Bull & Bear account UUID to link after OAuth completes
 */

import { NextResponse } from "next/server";

import { verifyAccountOwnership, withAuth } from "@/lib/api";

const CTRADER_CLIENT_ID = process.env.CTRADER_CLIENT_ID ?? "";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  if (!CTRADER_CLIENT_ID) {
    return NextResponse.json(
      { error: "cTrader integration is not configured on this server" },
      { status: 503 },
    );
  }

  // Verify the account belongs to the user
  const account = await verifyAccountOwnership(accountId, user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Encode accountId in the state param so the callback knows which account to link
  const state = Buffer.from(JSON.stringify({ accountId })).toString("base64url");
  const redirectUri = `${APP_URL}/api/connections/ctrader/callback`;

  const params = new URLSearchParams({
    client_id: CTRADER_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "accounts",
    product: "web",
    state,
  });

  const authUrl = `https://id.ctrader.com/my/settings/openapi/grantingaccess/?${params.toString()}`;

  return NextResponse.json({ authUrl });
});
