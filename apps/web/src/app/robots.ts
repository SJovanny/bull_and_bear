import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://www.bullandbear.pro");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/faq",
          "/contact",
          "/pricing",
          "/legal/",
        ],
        disallow: [
          "/dashboard",

          "/journal",
          "/calendar",
          "/stats",
          "/notes",
          "/comptes",
          "/profil",
          "/trades/",
          "/onboarding",
          "/api/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
