/**
 * cTrader Open API – JSON/WebSocket client (port 5036)
 *
 * Establishes a short-lived WebSocket connection, authenticates the app and
 * a specific cTrader account, fetches all closed deals in a given time range
 * then closes the socket.  Designed to run inside a Next.js serverless
 * function (Vercel) – total round-trip is typically 1-8 seconds.
 *
 * Protocol reference:
 *   https://help.ctrader.com/open-api/
 *   Payload types: https://github.com/spotware/openapi-proto-messages
 */

// Uses the native WebSocket global available in Node.js 18+ and all browsers.
// No external 'ws' package needed.

// ─── Payload type constants ──────────────────────────────────────────────────

const PT = {
  // Application auth
  APP_AUTH_REQ: 2100,
  APP_AUTH_RES: 2101,
  // Account auth
  ACCOUNT_AUTH_REQ: 2102,
  ACCOUNT_AUTH_RES: 2103,
  // Trader account list
  GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ: 2149,
  GET_ACCOUNTS_BY_ACCESS_TOKEN_RES: 2150,
  // Symbols (light list)
  SYMBOLS_LIST_REQ: 2114,
  SYMBOLS_LIST_RES: 2115,
  // Full symbol by ID (includes lotSize)
  SYMBOL_BY_ID_REQ: 2116,
  SYMBOL_BY_ID_RES: 2117,
  // Open positions reconcile
  RECONCILE_REQ: 2124,
  RECONCILE_RES: 2125,
  // Deal list
  DEAL_LIST_REQ: 2133,
  DEAL_LIST_RES: 2134,
  // Error
  ERROR_RES: 2142,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type CTraderCredentials = {
  clientId: string;
  clientSecret: string;
};

export type CTraderDeal = {
  dealId: string;
  orderId: string;
  positionId: string;
  /** Volume in 1/100 of a lot (cents).  Divide by 100 to get lots. */
  volume: number;
  filledVolume: number;
  symbolId: number;
  createTimestamp: number;
  executionTimestamp: number;
  executionPrice: number;
  /** 1 = BUY, 2 = SELL */
  tradeSide: 1 | 2;
  /**
   * 2 = FILLED, 3 = PARTIALLY_FILLED, 4 = REJECTED …
   * Only FILLED deals are meaningful for trade reconstruction.
   */
  dealStatus: number;
  commission: number;
  /** Monetary exponent: divide monetary int values by 10^moneyDigits */
  moneyDigits: number;
  label?: string;
  comment?: string;
  closePositionDetail?: {
    entryPrice: number;
    grossProfit: number;
    swap: number;
    commission: number;
    balance: number;
    closedVolume: number;
    pnlConversionFee?: number;
  };
};

export type CTraderAccountInfo = {
  ctidTraderAccountId: string;
  isLive: boolean;
  traderLogin?: string;
  brokerTitle?: string;
};

export type CTraderSymbol = {
  symbolId: number;
  symbolName: string;
  /** Lot size in cents (e.g. 10000000 = 100,000 units for standard forex lot).
   *  lots = filledVolume / lotSize  */
  lotSize: number;
};

/** A currently-open position returned by ProtoOAReconcileRes. */
export type CTraderPosition = {
  positionId: string;
  tradeData: {
    symbolId: number;
    /** Volume in cents (same unit as deal filledVolume). */
    volume: number;
    /** 1 = BUY, 2 = SELL */
    tradeSide: 1 | 2;
    /** Unix ms when the position was opened. */
    openTimestamp?: number;
    comment?: string;
  };
  /** VWAP entry price of the position. */
  price?: number;
  /** Unrealized commission (signed int, divide by 10^moneyDigits). */
  commission?: number;
  /** Accumulated swap (signed int, divide by 10^moneyDigits). */
  swap?: number;
  moneyDigits?: number;
};

// ─── Internal helpers ────────────────────────────────────────────────────────

interface RawMessage {
  clientMsgId?: string;
  payloadType: number;
  payload?: Record<string, unknown>;
}

function createClient(isLive: boolean): Promise<WebSocket> {
  const host = isLive ? "live.ctraderapi.com" : "demo.ctraderapi.com";
  const url = `wss://${host}:5036`;
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws), { once: true });
    ws.addEventListener("error", (e) => reject(e), { once: true });
  });
}

/**
 * Send a JSON message and wait for a specific response payload type.
 * Rejects on error response or timeout.
 */
function sendAndWait(
  ws: WebSocket,
  msg: RawMessage,
  expectedType: number,
  timeoutMs = 15_000,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", handler);
      reject(new Error(`Timeout waiting for payloadType ${expectedType}`));
    }, timeoutMs);

    function handler(event: MessageEvent) {
      let parsed: RawMessage;
      try {
        parsed = JSON.parse(event.data as string) as RawMessage;
      } catch {
        return;
      }

      if (parsed.payloadType === PT.ERROR_RES) {
        clearTimeout(timer);
        ws.removeEventListener("message", handler);
        const errPayload = parsed.payload ?? {};
        reject(
          new Error(
            `cTrader error ${errPayload.errorCode as string}: ${errPayload.description as string}`,
          ),
        );
        return;
      }

      if (parsed.payloadType === expectedType) {
        clearTimeout(timer);
        ws.removeEventListener("message", handler);
        resolve(parsed.payload ?? {});
      }
    }

    ws.addEventListener("message", handler);
    ws.send(JSON.stringify(msg));
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Exchange an OAuth authorization code for access + refresh tokens.
 * This is a REST call (not WebSocket) to the cTrader token endpoint.
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  credentials: CTraderCredentials,
): Promise<{ accessToken: string; refreshToken: string; expiresInSeconds: number }> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
  });

  const res = await fetch(
    `https://openapi.ctrader.com/apps/token?${params.toString()}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(`cTrader token exchange failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    errorCode?: string;
    description?: string;
  };

  if (!data.accessToken || !data.refreshToken) {
    throw new Error(
      data.errorCode
        ? `cTrader token error ${data.errorCode}: ${data.description}`
        : "cTrader token exchange returned no tokens",
    );
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresInSeconds: data.expiresIn ?? 2_628_000, // default ~30 days
  };
}

/**
 * Refresh an expired access token using the stored refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string,
  credentials: CTraderCredentials,
): Promise<{ accessToken: string; refreshToken: string; expiresInSeconds: number }> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
  });

  const res = await fetch(
    `https://openapi.ctrader.com/apps/token?${params.toString()}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(`cTrader token refresh failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    errorCode?: string;
    description?: string;
  };

  if (!data.accessToken || !data.refreshToken) {
    throw new Error(
      data.errorCode
        ? `cTrader refresh error ${data.errorCode}: ${data.description}`
        : "cTrader token refresh returned no tokens",
    );
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresInSeconds: data.expiresIn ?? 2_628_000,
  };
}

/**
 * List all cTrader trading accounts associated with an access token.
 * Used right after the OAuth callback to let the user pick which account to link.
 */
export async function listCTraderAccounts(
  accessToken: string,
  credentials: CTraderCredentials,
): Promise<CTraderAccountInfo[]> {
  // Use live endpoint to list accounts (works for both live and demo)
  const ws = await createClient(true);

  try {
    // 1. App auth
    await sendAndWait(
      ws,
      { payloadType: PT.APP_AUTH_REQ, payload: { clientId: credentials.clientId, clientSecret: credentials.clientSecret } },
      PT.APP_AUTH_RES,
    );

    // 2. List accounts by access token
    const res = await sendAndWait(
      ws,
      {
        payloadType: PT.GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
        payload: { accessToken },
      },
      PT.GET_ACCOUNTS_BY_ACCESS_TOKEN_RES,
    );

    const accounts = (res.ctidTraderAccount as CTraderAccountInfo[] | undefined) ?? [];
    return accounts;
  } finally {
    ws.close();
  }
}

/**
 * Fetch all closed deals for a cTrader account within a time range.
 * Returns deals grouped by positionId and a symbolId→name map.
 *
 * @param accessToken   User's valid cTrader access token
 * @param ctidAccountId Numeric cTrader account ID (as string)
 * @param isLive        Whether to connect to live or demo endpoint
 * @param fromMs        Start of range (Unix ms) – usually lastSyncAt or epoch
 * @param toMs          End of range (Unix ms) – usually now()
 * @param credentials   App client ID + secret
 */
export async function fetchDealsForAccount(
  accessToken: string,
  ctidAccountId: string,
  isLive: boolean,
  fromMs: number,
  toMs: number,
  credentials: CTraderCredentials,
): Promise<{ deals: CTraderDeal[]; positions: CTraderPosition[]; symbolMap: Map<number, CTraderSymbol> }> {
  const ws = await createClient(isLive);

  try {
    const ctidTraderAccountId = parseInt(ctidAccountId, 10);

    // 1. App auth
    await sendAndWait(
      ws,
      { payloadType: PT.APP_AUTH_REQ, payload: { clientId: credentials.clientId, clientSecret: credentials.clientSecret } },
      PT.APP_AUTH_RES,
    );

    // 2. Account auth
    await sendAndWait(
      ws,
      {
        payloadType: PT.ACCOUNT_AUTH_REQ,
        payload: { ctidTraderAccountId, accessToken },
      },
      PT.ACCOUNT_AUTH_RES,
    );

    // 3. Light symbol list — symbolId → name mapping
    const symbolsRes = await sendAndWait(
      ws,
      { payloadType: PT.SYMBOLS_LIST_REQ, payload: { ctidTraderAccountId } },
      PT.SYMBOLS_LIST_RES,
    );

    type LightSymbol = { symbolId: number; symbolName?: string };
    const lightSymbols = (symbolsRes.symbol as LightSymbol[] | undefined) ?? [];
    const nameById = new Map<number, string>();
    for (const s of lightSymbols) {
      if (s.symbolName) nameById.set(s.symbolId, s.symbolName);
    }

    // 4. Paginated deal list (closed trades)
    const allDeals: CTraderDeal[] = [];
    let hasMore = true;
    let currentFrom = fromMs;

    while (hasMore) {
      const res = await sendAndWait(
        ws,
        {
          payloadType: PT.DEAL_LIST_REQ,
          payload: {
            ctidTraderAccountId,
            fromTimestamp: currentFrom,
            toTimestamp: toMs,
            maxRows: 1000,
          },
        },
        PT.DEAL_LIST_RES,
      );

      const page = (res.deal as CTraderDeal[] | undefined) ?? [];
      allDeals.push(...page.filter((d) => d.dealStatus === 2));

      hasMore = res.hasMore === true;
      if (hasMore && page.length > 0) {
        const lastTs = page[page.length - 1]?.executionTimestamp;
        if (lastTs != null && lastTs > currentFrom) {
          currentFrom = lastTs + 1;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    // 5. Reconcile — fetch currently open positions
    const reconcileRes = await sendAndWait(
      ws,
      { payloadType: PT.RECONCILE_REQ, payload: { ctidTraderAccountId } },
      PT.RECONCILE_RES,
    );
    const openPositions = (reconcileRes.position as CTraderPosition[] | undefined) ?? [];

    // 6. Collect all unique symbolIds from both deals and open positions
    const uniqueSymbolIds = [
      ...new Set([
        ...allDeals.map((d) => d.symbolId),
        ...openPositions.map((p) => p.tradeData.symbolId),
      ]),
    ];

    // 7. Fetch full symbol details (includes lotSize) for all traded symbols
    const symbolMap = new Map<number, CTraderSymbol>();

    if (uniqueSymbolIds.length > 0) {
      const fullRes = await sendAndWait(
        ws,
        {
          payloadType: PT.SYMBOL_BY_ID_REQ,
          payload: { ctidTraderAccountId, symbolId: uniqueSymbolIds },
        },
        PT.SYMBOL_BY_ID_RES,
      );

      type FullSymbol = { symbolId: number; lotSize?: number };
      const fullSymbols = (fullRes.symbol as FullSymbol[] | undefined) ?? [];
      for (const s of fullSymbols) {
        symbolMap.set(s.symbolId, {
          symbolId: s.symbolId,
          symbolName: nameById.get(s.symbolId) ?? `SYMBOL_${s.symbolId}`,
          lotSize: s.lotSize ?? 10_000_000,
        });
      }
    }

    // Fallback for any symbolId not returned by the full lookup
    for (const id of uniqueSymbolIds) {
      if (!symbolMap.has(id)) {
        symbolMap.set(id, {
          symbolId: id,
          symbolName: nameById.get(id) ?? `SYMBOL_${id}`,
          lotSize: 10_000_000,
        });
      }
    }

    return { deals: allDeals, positions: openPositions, symbolMap };
  } finally {
    ws.close();
  }
}
