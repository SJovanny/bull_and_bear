/**
 * Returns true when the given pathname is a public (unauthenticated) route.
 * Used by both the root middleware and the Supabase session middleware to
 * skip auth checks on marketing / static pages.
 *
 * Keep this as the single source of truth — do NOT duplicate this logic.
 */
export function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/legal/") ||
    pathname === "/faq" ||
    pathname === "/contact" ||
    pathname === "/pricing" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/sw.js" ||
    pathname === "/offline.html" ||
    pathname === "/manifest.webmanifest" ||
    // Self-authenticated with CRON_SECRET (no user session on cron calls)
    pathname.startsWith("/api/cron/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  );
}
