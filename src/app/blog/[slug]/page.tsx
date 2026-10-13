import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { parseBlogBody } from "@/features/blog/body";
import { getPublishedBlogPost } from "@/features/blog/server";
import { publicPageMetadata } from "@/lib/page-metadata";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();
  const base = publicPageMetadata(`/blog/${slug}`, post.title, post.excerpt, post.cover_image_url || undefined);
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();
  const url = absoluteUrl(`/blog/${post.slug}`);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    mainEntityOfPage: url,
    url,
    author: { "@type": post.author_name === "Purple Squad Team" ? "Organization" : "Person", name: post.author_name },
    publisher: { "@type": "Organization", name: "Purple Squad", url: absoluteUrl("/") },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.cover_image_url ? { image: [post.cover_image_url] } : {}),
  };
  return (
    <article className="page-container max-w-4xl py-12">
      <JsonLd data={[articleSchema, breadcrumbJsonLd([
        { name: "Home", path: "/" }, { name: "Home Care Guides", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` },
      ])]} />
      <nav aria-label="Breadcrumb" className="text-sm"><Link href="/blog" className="text-primary underline">Home Care Guides</Link></nav>
      <h1 className="mt-6 text-3xl font-bold leading-tight text-foreground sm:text-4xl">{post.title}</h1>
      <p className="mt-4 text-lg leading-8 text-secondary">{post.excerpt}</p>
      <p className="mt-4 text-sm text-secondary">By {post.author_name}{post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "long" })}` : ""}</p>
      {post.cover_image_url ? <Image src={post.cover_image_url} alt={`Illustration for ${post.title}`} width={1200} height={675} unoptimized className="mt-8 aspect-video w-full rounded-xl object-cover" /> : null}
      <div className="mt-10 space-y-6">
        {parseBlogBody(post.body).map((block, index) => block.kind === "heading"
          ? <h2 key={index} className="text-2xl font-bold text-foreground">{block.text}</h2>
          : <p key={index} className="leading-8 text-secondary">{block.text}</p>)}
      </div>
      {post.related_service_slug ? <section className="mt-10 rounded-xl border border-primary/20 bg-primary-soft p-6"><h2 className="text-xl font-bold">Need professional help?</h2><p className="mt-2 text-secondary">View the related Purple Squad service and check availability for your address.</p><Link href={`/services/${post.related_service_slug}`} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-white">View service</Link></section> : null}
      <Link href="/blog" className="mt-10 inline-block font-semibold text-primary underline">More Home Care Guides</Link>
    </article>
  );
}
