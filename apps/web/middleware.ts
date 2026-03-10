import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Build a Content-Security-Policy header value with a per-request nonce.
 *
 * `'strict-dynamic'` tells modern browsers to trust any script loaded by a
 * nonce-bearing script, so we don't need to allowlist CDN hosts individually.
 * `'unsafe-inline'` is kept as a fallback for older browsers that don't
 * support nonces — modern browsers ignore `'unsafe-inline'` when a nonce is
 * present, so this doesn't weaken the policy.
 */
function buildCsp(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    // Fallback for browsers without nonce/strict-dynamic support:
    "'unsafe-inline'",
    // Next.js HMR / Fast Refresh requires eval in development:
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.twelvedata.com",
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  // Generate a cryptographically random nonce for this request.
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");

  // Create the response first, attaching the CSP + nonce headers, then hand
  // it to updateSession so Supabase cookie logic can layer onto the same
  // response object.
  const response = NextResponse.next({ request });
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("x-nonce", nonce);

  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
