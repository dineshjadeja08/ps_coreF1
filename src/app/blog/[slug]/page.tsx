import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Clock3 } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { parseBlogBody } from "@/features/blog/body";
import { getPublishedBlogPost, getPublishedBlogPosts } from "@/features/blog/server";
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

function headingId(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();
  const blocks = parseBlogBody(post.body);
  const headings = blocks.filter((block) => block.kind === "heading");
  const words = post.body.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 210));
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;
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
  let morePosts: Awaited<ReturnType<typeof getPublishedBlogPosts>> = [];
  try {
    morePosts = (await getPublishedBlogPosts()).filter((item) => item.slug !== post.slug).slice(0, 2);
  } catch {
    // The article remains readable even if the optional recommendations request fails.
  }

  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-16">
      <JsonLd data={[articleSchema, breadcrumbJsonLd([
        { name: "Home", path: "/" }, { name: "Home Care Journal", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` },
      ])]} />
      <div className="page-container pt-7 sm:pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#817987]"><Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"><ArrowLeft size={15} /> Home Care Journal</Link><span aria-hidden="true">/</span><span className="max-w-[55vw] truncate">{post.title}</span></nav>
        <article className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-[#ece8e2] bg-white shadow-[0_18px_50px_rgba(38,25,57,0.07)]">
          <header className="mx-auto max-w-4xl px-6 pb-8 pt-8 sm:px-12 sm:pb-10 sm:pt-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary"><BookOpen size={14} /> Home care & appliance advice</span>
            <h1 className="mt-6 text-3xl font-extrabold leading-[1.12] tracking-tight text-[#20192b] sm:text-5xl">{post.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#716b77] sm:text-xl">{post.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#eeeaf0] pt-5 text-sm text-[#817987]">
              <span className="font-semibold text-[#393142]">By {post.author_name}</span>
              {date && <span className="inline-flex items-center gap-2"><CalendarDays size={15} />{date}</span>}
              <span className="inline-flex items-center gap-2"><Clock3 size={15} />{readingMinutes} min read</span>
            </div>
          </header>
          {post.cover_image_url ? <div className="relative aspect-[16/8] w-full overflow-hidden bg-violet-50"><Image src={post.cover_image_url} alt={post.title} width={1440} height={720} unoptimized priority className="h-full w-full object-cover" /></div> : <div className="mx-6 flex aspect-[16/6] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 text-primary sm:mx-12"><BookOpen size={46} strokeWidth={1.3} aria-hidden="true" /></div>}
          <div className="grid gap-10 px-6 py-9 sm:px-12 sm:py-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
            <div className="min-w-0">
              <div className="space-y-6 text-[1.0625rem] leading-8 text-[#514b58]">
                {blocks.map((block, index) => block.kind === "heading"
                  ? <h2 id={headingId(block.text)} key={index} className="scroll-mt-24 pt-4 text-2xl font-extrabold leading-tight tracking-tight text-[#251d30] sm:text-3xl">{block.text}</h2>
                  : <p key={index}>{block.text}</p>)}
              </div>
              {post.related_service_slug ? <section className="mt-10 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Purple Squad service</p><h2 className="mt-2 text-xl font-bold text-[#251d30]">Want an expert to take a look?</h2><p className="mt-2 leading-7 text-[#716b77]">Explore the related service, check what’s included and find a convenient booking slot.</p><Link href={`/services/${post.related_service_slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-white transition hover:bg-primary-hover">View service <ArrowRight size={16} /></Link></section> : null}
            </div>
            {headings.length > 1 && <aside className="h-fit rounded-2xl border border-[#eeeaf0] bg-[#fcfbfd] p-5 lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#817987]">In this article</p><nav aria-label="Article contents" className="mt-4 space-y-3">{headings.map((heading) => <a key={heading.text} href={`#${headingId(heading.text)}`} className="block text-sm leading-5 text-[#514b58] transition hover:text-primary">{heading.text}</a>)}</nav></aside>}
          </div>
        </article>

        <div className="mx-auto mt-8 flex max-w-5xl items-center justify-between"><Link href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#e8e1ed] bg-white px-4 text-sm font-bold text-primary transition hover:bg-primary-soft"><ArrowLeft size={16} /> All articles</Link><Link href="/services" className="text-sm font-semibold text-[#6f6876] hover:text-primary">Explore services <ArrowRight className="ml-1 inline" size={15} /></Link></div>

        {morePosts.length > 0 && <section className="mx-auto mt-14 max-w-5xl" aria-labelledby="more-reading"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Keep exploring</p><h2 id="more-reading" className="mt-1 text-2xl font-extrabold text-[#20192b]">More helpful reads</h2></div><div className="grid gap-5 sm:grid-cols-2">{morePosts.map((item) => <Link key={item.id} href={`/blog/${item.slug}`} className="group rounded-2xl border border-[#ece8e2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="text-xs font-semibold text-[#817987]">{item.published_at ? new Date(item.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Purple Squad Journal"}</span><h3 className="mt-2 text-lg font-bold leading-snug text-[#251d30] group-hover:text-primary">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#716b77]">{item.excerpt}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Read next <ArrowRight size={15} /></span></Link>)}</div></section>}
      </div>
    </main>
  );
}
