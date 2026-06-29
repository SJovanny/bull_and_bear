import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isPublicRoute } from "@/lib/public-routes";

export async function middleware(request: NextRequest) {
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });
  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|/api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
