import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Sparkles } from "lucide-react";

import { getPublishedBlogPosts } from "@/features/blog/server";
import { publicPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublishedBlogPosts();
  return {
    ...publicPageMetadata(
      "/blog", "Home Care Journal", "Expert appliance care advice, troubleshooting tips and practical service guides from Purple Squad.",
    ),
    ...(!posts.length ? { robots: { index: false, follow: true } } : {}),
  };
}

function publishedDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Purple Squad Editorial";
}

function ArticleImage({ title, image, featured = false }: { title: string; image?: string | null; featured?: boolean }) {
  return image ? (
    <Image src={image} alt={title} width={featured ? 1200 : 720} height={featured ? 675 : 450} unoptimized className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
  ) : (
    <div aria-label={`${title} article artwork`} className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 text-primary">
      <BookOpen size={featured ? 48 : 34} strokeWidth={1.4} aria-hidden="true" />
    </div>
  );
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const [featured, ...latest] = posts;
  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-20">
      <section className="border-b border-[#ece8e2] bg-[radial-gradient(ellipse_at_top_left,_#f2eaff,_transparent_55%),linear-gradient(135deg,#fffdfb,#f9f7f2)]">
        <div className="page-container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm"><Sparkles size={14} /> Purple Squad Journal</span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#20192b] sm:text-6xl">A little more know-how.<br /><span className="text-primary">A lot less home stress.</span></h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6f6876] sm:text-lg">Clear, practical advice for keeping your appliances at their best — from everyday care to knowing when it’s time to call a professional.</p>
          </div>
        </div>
      </section>

      <div className="page-container pt-10 sm:pt-14">
        {featured ? (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Editor’s pick</p><h2 className="mt-1 text-xl font-bold text-[#20192b]">Start with this guide</h2></div>
              <Link href="/guides" className="hidden items-center gap-2 text-sm font-semibold text-primary hover:underline sm:inline-flex">Browse care guides <ArrowRight size={16} /></Link>
            </div>
            <article className="group grid overflow-hidden rounded-3xl border border-[#ece8e2] bg-white shadow-[0_18px_50px_rgba(38,25,57,0.08)] md:grid-cols-[1.15fr_0.85fr]">
              <Link href={`/blog/${featured.slug}`} aria-label={`Read ${featured.title}`} className="relative block aspect-[16/10] overflow-hidden bg-violet-50 md:aspect-auto md:min-h-[390px]"><ArticleImage title={featured.title} image={featured.cover_image_url} featured /></Link>
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <span className="w-fit rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">Featured article</span>
                <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#817987]"><CalendarDays size={14} /> {publishedDate(featured.published_at)} <span aria-hidden="true">·</span> Purple Squad Team</div>
                <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-[#20192b] sm:text-3xl"><Link href={`/blog/${featured.slug}`} className="hover:text-primary">{featured.title}</Link></h2>
                <p className="mt-4 line-clamp-4 leading-7 text-[#716b77]">{featured.excerpt}</p>
                <Link href={`/blog/${featured.slug}`} className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-primary px-5 font-bold text-white shadow-[0_8px_20px_rgba(109,40,217,0.22)] transition hover:bg-primary-hover">Read the story <ArrowRight size={17} /></Link>
              </div>
            </article>
          </>
        ) : (
          <div className="rounded-3xl border border-[#ece8e2] bg-white px-6 py-16 text-center shadow-sm"><BookOpen className="mx-auto text-primary" size={40} /><h2 className="mt-4 text-2xl font-bold text-[#20192b]">The journal is getting ready</h2><p className="mx-auto mt-2 max-w-lg leading-7 text-secondary">Fresh appliance advice is on its way. In the meantime, explore our practical care guides.</p><Link href="/guides" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white">Browse care guides <ArrowRight size={16} /></Link></div>
        )}

        {latest.length > 0 && <section className="mt-14 sm:mt-20" aria-labelledby="latest-articles"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">The latest</p><h2 id="latest-articles" className="mt-1 text-2xl font-extrabold tracking-tight text-[#20192b] sm:text-3xl">More from the journal</h2></div><span className="hidden text-sm text-[#817987] sm:block">Thoughtful tips for a happier home</span></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => <article key={post.id} className="group overflow-hidden rounded-2xl border border-[#ece8e2] bg-white shadow-[0_8px_28px_rgba(38,25,57,0.045)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(38,25,57,0.1)]">
              <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="block aspect-[16/10] overflow-hidden bg-violet-50"><ArticleImage title={post.title} image={post.cover_image_url} /></Link>
              <div className="p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-medium text-[#817987]"><CalendarDays size={13} />{publishedDate(post.published_at)}</div><h3 className="mt-3 text-xl font-bold leading-snug text-[#20192b]"><Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-primary">{post.title}</Link></h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#716b77]">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Read article <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></div>
            </article>)}
          </div>
        </section>}

        {posts.length > 0 && <section className="mt-14 flex flex-col justify-between gap-6 rounded-3xl bg-[#251936] p-7 text-white sm:mt-20 sm:flex-row sm:items-center sm:p-10"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200">Need a hand?</p><h2 className="mt-2 text-2xl font-bold">Some fixes are better left to a pro.</h2><p className="mt-2 max-w-xl leading-6 text-violet-100/75">Explore Purple Squad services and find the right help for your appliance.</p></div><Link href="/services" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 font-bold text-[#251936] transition hover:bg-violet-100">Explore services <ArrowRight size={16} /></Link></section>}
      </div>
    </main>
  );
}
