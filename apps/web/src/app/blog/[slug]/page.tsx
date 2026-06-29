import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog/posts";
import { ArticleLayout } from "@/components/blog/article-layout";
import { JsonLd } from "@/components/json-ld";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { robots: { index: false, follow: false } };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://www.bullandbear.pro/blog/${post.slug}`,
    },
    openGraph: {
      siteName: "Bull & Bear",
      title: post.title,
      description: post.description,
      url: `https://www.bullandbear.pro/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: "https://www.bullandbear.pro/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://www.bullandbear.pro/og-image.png"],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `https://www.bullandbear.pro/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    // post.author is always "Bull & Bear Team" — reference the canonical Organization entity
    author: {
      "@id": "https://www.bullandbear.pro/#organization",
    },
    publisher: {
      "@id": "https://www.bullandbear.pro/#organization",
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `https://www.bullandbear.pro/blog/${post.slug}`,
    image: "https://www.bullandbear.pro/og-image.png",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.bullandbear.pro/blog/${post.slug}`,
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <ArticleLayout post={post} related={related} />
    </>
  );
}
