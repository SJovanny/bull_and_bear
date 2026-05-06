import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/legal/") ||
    pathname === "/faq" ||
    pathname === "/contact" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt";

  if (isPublicPage) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });
  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
