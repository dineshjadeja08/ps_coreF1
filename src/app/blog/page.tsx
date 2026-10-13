import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Search, Sparkles } from "lucide-react";

import { availableBlogCategories, categoryForPost, filterBlogPosts } from "@/features/blog/category";
import { getPublishedBlogPosts } from "@/features/blog/server";
import { maintenanceGuides } from "@/features/catalogue/maintenance-guides";
import { publicPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let hasPosts = false;
  try { hasPosts = (await getPublishedBlogPosts()).length > 0; } catch { /* Keep the public journal available during a temporary API outage. */ }
  return {
    ...publicPageMetadata(
      "/blog", "Purple Squad Journal", "Expert advice, practical guides, and smarter ways to care for your home.",
    ),
    ...(!hasPosts ? { robots: { index: false, follow: true } } : {}),
  };
}

function publishedDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Purple Squad Editorial";
}

function ArticleImage({ title, image, featured = false }: { title: string; image?: string | null; featured?: boolean }) {
  return image ? (
    <Image src={image} alt={title} width={featured ? 1200 : 720} height={featured ? 675 : 450} sizes={featured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
  ) : (
    <div aria-label={`${title} article artwork`} className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 text-primary">
      <BookOpen size={featured ? 48 : 34} strokeWidth={1.4} aria-hidden="true" />
    </div>
  );
}

type Props = { searchParams: Promise<{ q?: string; category?: string }> };

function withFilters(query: string, category: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  const value = params.toString();
  return value ? `/blog?${value}` : "/blog";
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedCategory = params.category ?? "";
  let posts: Awaited<ReturnType<typeof getPublishedBlogPosts>> = [];
  let loadFailed = false;
  try { posts = await getPublishedBlogPosts(); } catch { loadFailed = true; }
  const categories = availableBlogCategories(posts);
  const filteredPosts = filterBlogPosts(posts, query, selectedCategory);
  const [featured, ...latest] = filteredPosts;
  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-20">
      <section className="border-b border-[#ece8e2] bg-[radial-gradient(ellipse_at_top_left,_#f2eaff,_transparent_55%),linear-gradient(135deg,#fffdfb,#f9f7f2)]">
        <div className="page-container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary"><Sparkles size={14} /> The Purple Squad Journal</span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#20192b] sm:text-6xl">Better Living Begins<br className="hidden sm:block" /> at Home.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6f6876] sm:text-lg">Expert advice, practical guides, and smarter ways to care for your home.</p>
            <form action="/blog" method="get" className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-[#e8e2ed] bg-white p-2 shadow-[0_6px_22px_rgba(38,25,57,0.06)] focus-within:ring-2 focus-within:ring-primary/30">
              <Search className="ml-3 h-5 w-5 shrink-0 text-[#827a8b]" aria-hidden="true" />
              <input type="search" name="q" defaultValue={query} placeholder="Search home care guides, tips, and solutions..." aria-label="Search journal articles" className="min-h-11 min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-[#a39ba9] focus:ring-0" />
              {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
              <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover">Search</button>
            </form>
          </div>
        </div>
      </section>

      <div className="page-container pt-10 sm:pt-14">
        {categories.length > 0 && <nav aria-label="Journal categories" className="mobile-scroll-row mb-10 flex gap-2 overflow-x-auto pb-2">
          <Link aria-current={!selectedCategory ? "page" : undefined} href={withFilters(query, "")} className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${!selectedCategory ? "border-[#36006D] bg-[#36006D] text-white" : "border-[#e8e2ed] bg-white text-[#615a68] hover:border-primary hover:text-primary"}`}>All Stories</Link>
          {categories.map((category) => <Link key={category.slug} aria-current={selectedCategory === category.slug ? "page" : undefined} href={withFilters(query, category.slug)} className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === category.slug ? "border-[#36006D] bg-[#36006D] text-white" : "border-[#e8e2ed] bg-white text-[#615a68] hover:border-primary hover:text-primary"}`}>{category.label}</Link>)}
        </nav>}
        {featured ? (
          <>
              <div className="mb-5 flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Editor’s pick</p><h2 className="mt-1 text-xl font-bold text-[#20192b]">Start with this guide</h2></div>
              <Link href="/guides" className="hidden items-center gap-2 text-sm font-semibold text-primary hover:underline sm:inline-flex">Browse care guides <ArrowRight size={16} /></Link>
            </div>
            <article className="group grid overflow-hidden rounded-3xl border border-[#ece8e2] bg-white shadow-[0_18px_50px_rgba(38,25,57,0.08)] md:grid-cols-[1.15fr_0.85fr]">
              <Link href={`/blog/${featured.slug}`} aria-label={`Read ${featured.title}`} className="relative block aspect-[16/10] overflow-hidden bg-violet-50 md:aspect-auto md:min-h-[390px]"><ArticleImage title={featured.title} image={featured.cover_image_url} featured /></Link>
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <span className="w-fit rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">{categoryForPost(featured).label}</span>
                <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#817987]"><CalendarDays size={14} /> {publishedDate(featured.published_at)} <span aria-hidden="true">·</span> {featured.author_name}</div>
                <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-[#20192b] sm:text-3xl"><Link href={`/blog/${featured.slug}`} className="hover:text-primary">{featured.title}</Link></h2>
                <p className="mt-4 line-clamp-4 leading-7 text-[#716b77]">{featured.excerpt}</p>
                <Link href={`/blog/${featured.slug}`} className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 border-b-2 border-primary pb-1 font-bold text-primary transition hover:gap-3">Read story <ArrowRight size={17} /></Link>
              </div>
            </article>
          </>
        ) : (
          <div className="rounded-3xl border border-[#ece8e2] bg-white px-6 py-16 text-center"><BookOpen className="mx-auto text-primary" size={40} /><h2 className="mt-4 text-2xl font-bold text-[#20192b]">{loadFailed ? "The journal is temporarily unavailable" : query || selectedCategory ? "No stories match your search" : "The journal is getting ready"}</h2><p className="mx-auto mt-2 max-w-lg leading-7 text-secondary">{loadFailed ? "Please try again in a little while, or browse our existing care guides." : "Try another search, or explore our practical care guides."}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/guides" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white">Browse care guides <ArrowRight size={16} /></Link>{(query || selectedCategory) && <Link href="/blog" className="inline-flex min-h-11 items-center rounded-xl border border-[#e8e2ed] px-5 font-semibold text-[#514b58]">Clear filters</Link>}</div></div>
        )}

        {latest.length > 0 && <section className="mt-14 sm:mt-20" aria-labelledby="latest-articles"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Fresh perspectives</p><h2 id="latest-articles" className="mt-1 text-2xl font-extrabold tracking-tight text-[#20192b] sm:text-3xl">Latest stories</h2><p className="mt-2 text-sm text-[#817987]">Helpful ideas and expert insights for everyday home care.</p></div><span className="hidden text-sm text-[#817987] sm:block">Thoughtful tips for a happier home</span></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => <article key={post.id} className="group overflow-hidden rounded-2xl border border-[#ece8e2] bg-white shadow-[0_8px_28px_rgba(38,25,57,0.045)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(38,25,57,0.1)]">
              <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="block aspect-[16/10] overflow-hidden bg-violet-50"><ArticleImage title={post.title} image={post.cover_image_url} /></Link>
              <div className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{categoryForPost(post).label}</p><div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#817987]"><CalendarDays size={13} />{publishedDate(post.published_at)}</div><h3 className="mt-3 text-xl font-bold leading-snug text-[#20192b]"><Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-primary">{post.title}</Link></h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#716b77]">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Read article <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></div>
            </article>)}
          </div>
        </section>}

        <section className="mt-14 border-t border-[#ece8e2] pt-10 sm:mt-20 sm:pt-14" aria-labelledby="care-guides"><div className="mb-6 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Made for your home</p><h2 id="care-guides" className="mt-2 text-2xl font-extrabold tracking-tight text-[#20192b] sm:text-3xl">Your Home, Taken Care Of.</h2><p className="mt-2 leading-7 text-[#716b77]">Simple, useful checklists to help you care for your appliances and prepare for a service visit.</p></div><div className="grid gap-4 md:grid-cols-2">{Object.entries(maintenanceGuides).map(([slug, guide]) => <article key={slug} className="flex flex-col justify-between gap-5 rounded-2xl border border-[#ece8e2] bg-white p-6 sm:flex-row sm:items-center"><div><h3 className="text-lg font-bold leading-snug text-[#251d30]">{guide.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#716b77]">{guide.description}</p></div><Link href={`/guides/${slug}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-primary">Open guide <ArrowRight size={15} /></Link></article>)}</div></section>

        {posts.length > 0 && <section className="mt-14 flex flex-col justify-between gap-6 rounded-3xl bg-[#251936] p-7 text-white sm:mt-20 sm:flex-row sm:items-center sm:p-10"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200">Need a hand?</p><h2 className="mt-2 text-2xl font-bold">Some fixes are better left to a pro.</h2><p className="mt-2 max-w-xl leading-6 text-violet-100/75">Explore Purple Squad services and find the right help for your appliance.</p></div><Link href="/services" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 font-bold text-[#251936] transition hover:bg-violet-100">Explore services <ArrowRight size={16} /></Link></section>}
      </div>
    </main>
  );
}
