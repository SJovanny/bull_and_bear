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
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://bullandbear.pro/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://bullandbear.pro/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: "/og-image.png",
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
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://bullandbear.pro",
    },
    publisher: {
      "@type": "Organization",
      name: "Bull & Bear",
      url: "https://bullandbear.pro",
      logo: {
        "@type": "ImageObject",
        url: "https://bullandbear.pro/BB_logo.png",
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `https://bullandbear.pro/blog/${post.slug}`,
    image: "https://bullandbear.pro/og-image.png",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://bullandbear.pro/blog/${post.slug}`,
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <ArticleLayout post={post} related={related} />
    </>
  );
}
