import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isPublicRoute } from "@/lib/public-routes";

export async function middleware(request: NextRequest) {
  // Canonicalize bare domain → www.
  // API routes are excluded by the matcher config below, so OAuth callbacks
  // (e.g. /api/connections/ctrader/callback) are never redirected.
  const host = request.headers.get("host") ?? "";
  if (host === "bullandbear.pro") {
    const url = request.nextUrl.clone();
    url.host = "www.bullandbear.pro";
    return NextResponse.redirect(url, { status: 301 });
  }

  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });
  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|/api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
