import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedBlogPosts } from "@/features/blog/server";
import { publicPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublishedBlogPosts();
  return {
    ...publicPageMetadata(
      "/blog", "Home Care Guides", "Practical appliance care, repair and service guides from the Purple Squad team.",
    ),
    ...(!posts.length ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  return (
    <main className="page-container py-12">
      <p className="text-sm font-bold uppercase tracking-wide text-primary">Purple Squad guides</p>
      <h1 className="mt-2 text-4xl font-bold text-foreground">Home Care Guides</h1>
      <p className="mt-4 max-w-2xl leading-7 text-secondary">Helpful advice for caring for your appliances and preparing for a service visit.</p>
      {posts.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              {post.cover_image_url ? <Image src={post.cover_image_url} alt={`Illustration for ${post.title}`} width={800} height={450} unoptimized className="aspect-video w-full object-cover" /> : null}
              <div className="p-6">
                <p className="text-xs font-semibold text-secondary">{post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : ""}</p>
                <h2 className="mt-2 text-xl font-bold"><Link href={`/blog/${post.slug}`} className="text-foreground hover:text-primary">{post.title}</Link></h2>
                <p className="mt-3 line-clamp-3 leading-7 text-secondary">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="mt-4 inline-block font-semibold text-primary underline">Read guide</Link>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="mt-10 rounded-lg border border-border bg-white p-6 text-secondary">New guides are coming soon. Browse our existing <Link href="/guides" className="text-primary underline">appliance care guides</Link>.</p>}
    </main>
  );
}
