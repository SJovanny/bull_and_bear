import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog/posts";
import { ArticleCard } from "@/components/blog/article-card";

type ArticleLayoutProps = {
  post: BlogPost;
  related: BlogPost[];
};

export function ArticleLayout({ post, related }: ArticleLayoutProps) {
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/BB_logo.png" alt="Bull & Bear" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-slate-900 hidden sm:inline">Bull &amp; Bear</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-blue-600">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/blog" className="transition hover:text-blue-600">Blog</Link>
            <span className="text-slate-300">/</span>
            <span className="truncate max-w-[120px] sm:max-w-xs text-slate-700">{post.title}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Category pill */}
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {post.category}
          </span>
          <span className="text-xs text-slate-400">{post.readingTime} min read</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mt-6 flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
            B
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{post.author}</p>
            <p className="text-xs text-slate-400">{date}</p>
          </div>
        </div>

        {/* Cover emoji hero */}
        <div className="my-10 flex items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/40 py-14 text-7xl">
          {post.coverEmoji}
        </div>

        {/* Article body */}
        <article
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:text-slate-900 prose-h2:mt-12 prose-h2:mb-4 prose-h2:scroll-mt-24
            prose-h3:text-lg prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base
            prose-li:text-slate-600 prose-li:leading-relaxed
            prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-800 prose-strong:font-semibold
            prose-ol:text-slate-600 prose-ul:text-slate-600
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA banner */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-lg font-bold text-slate-900">Ready to start journaling?</p>
              <p className="mt-1 text-sm text-slate-600">
                Free 14-day trial — import your cTrader trades and get instant analytics.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 hover:shadow-lg"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </main>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50/60 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-xl font-bold text-slate-900">Related articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Bull &amp; Bear. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/blog" className="transition hover:text-blue-600">Blog</Link>
            <Link href="/legal/privacy-policy" className="transition hover:text-blue-600">Privacy Policy</Link>
            <Link href="/legal/terms" className="transition hover:text-blue-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
