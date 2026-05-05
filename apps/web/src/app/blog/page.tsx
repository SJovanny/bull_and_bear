import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { ArticleCard } from "@/components/blog/article-card";

export const metadata: Metadata = {
  title: "Trading Journal Blog — Tips, Guides & Insights",
  description:
    "Learn how to keep a trading journal, improve your performance, and make the most of tools like cTrader. Guides and insights from the Bull & Bear team.",
  keywords: [
    "trading journal blog",
    "trading tips",
    "how to journal trades",
    "trading performance guides",
    "cTrader journal guide",
  ],
  alternates: { canonical: "https://bullandbear.pro/blog" },
  openGraph: {
    title: "Trading Journal Blog — Bull & Bear",
    description:
      "Guides, tips, and insights on trading journals and performance analytics.",
    url: "https://bullandbear.pro/blog",
  },
};

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const [featured, ...rest] = sorted;

  const featuredDate = new Date(featured.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/BB_logo.png" alt="Bull & Bear" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-slate-900">Bull &amp; Bear</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-500 transition hover:text-slate-900">Home</Link>
            <Link href="/faq" className="text-slate-500 transition hover:text-slate-900">FAQ</Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
            >
              Start free trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Bull &amp; Bear Blog</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Trading Journal Guides & Insights
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
            Practical guides on how to journal your trades, analyse your performance, and become a more consistent trader.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* Featured article */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group mb-14 flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 lg:flex-row"
        >
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 px-12 py-16 text-8xl lg:w-72 lg:shrink-0">
            {featured.coverEmoji}
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                Featured
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {featured.category}
              </span>
              <span className="text-xs text-slate-400">{featured.readingTime} min read</span>
            </div>
            <h2 className="text-2xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">{featured.description}</p>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm text-slate-400">{featuredDate}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition group-hover:gap-2">
                Read article
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Rest of articles */}
        <h2 className="mb-6 text-lg font-bold text-slate-900">All Articles</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 sm:p-12 text-center">
          <p className="text-2xl font-bold text-slate-900">Start journaling your trades today</p>
          <p className="mt-3 text-slate-600">
            14-day free trial · cTrader & MetaTrader import · No credit card required
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-500 px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-400 hover:shadow-lg"
          >
            Create free account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Bull &amp; Bear. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="transition hover:text-blue-600">Home</Link>
            <Link href="/legal/privacy-policy" className="transition hover:text-blue-600">Privacy Policy</Link>
            <Link href="/legal/terms" className="transition hover:text-blue-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
