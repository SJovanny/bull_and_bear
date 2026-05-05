import Link from "next/link";
import type { BlogPost } from "@/lib/blog/posts";

type ArticleCardProps = {
  post: BlogPost;
};

export function ArticleCard({ post }: ArticleCardProps) {
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50"
    >
      {/* Cover */}
      <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/40 px-6 py-10 text-5xl">
        {post.coverEmoji}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        {/* Category + reading time */}
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {post.category}
          </span>
          <span className="text-xs text-slate-400">{post.readingTime} min read</span>
        </div>

        <h2 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
          {post.title}
        </h2>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
          {post.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">{date}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition group-hover:gap-2">
            Read article
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
