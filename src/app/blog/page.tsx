import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Search } from "lucide-react";

import { availableBlogCategories, categoryForPost, filterBlogPosts } from "@/features/blog/category";
import { getPublishedBlogPosts } from "@/features/blog/server";
import { maintenanceGuides } from "@/features/catalogue/maintenance-guides";
import { publicPageMetadata } from "@/lib/page-metadata";
import type { BlogPostSummary } from "@/types/api";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let hasPosts = false;
  try { hasPosts = (await getPublishedBlogPosts()).length > 0; } catch { /* Keep the journal available during an API interruption. */ }
  return {
    ...publicPageMetadata(
      "/blog", "Purple Squad Journal", "Thoughtful guides, expert insights, and everything you need to care for your home.",
    ),
    ...(!hasPosts ? { robots: { index: false, follow: true } } : {}),
  };
}

type Props = { searchParams: Promise<{ q?: string; category?: string }> };
type ImageSource = { src: string; alt: string };

const guideImages: Record<string, ImageSource> = {
  "ac-maintenance": { src: "/images/hero/ac-service.webp", alt: "Air conditioner in a bright, comfortable home" },
  "washing-machine-care": { src: "/images/hero/washing-machine-service.webp", alt: "Washing machine ready for routine care" },
};

function publishedDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Purple Squad Journal";
}

function withFilters(query: string, category: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  const value = params.toString();
  return value ? `/blog?${value}` : "/blog";
}

function ArticleImage({ post, sizes, className }: { post: BlogPostSummary; sizes: string; className: string }) {
  return post.cover_image_url ? (
    <Image
      src={post.cover_image_url}
      alt={post.title}
      fill
      sizes={sizes}
      className={`object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none ${className}`}
    />
  ) : (
    <div aria-label={`No cover image for ${post.title}`} className="absolute inset-0 grid place-items-center bg-[#f2edf7] text-primary">
      <BookOpen size={32} strokeWidth={1.4} aria-hidden="true" />
    </div>
  );
}

function StoryMeta({ post }: { post: BlogPostSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7d7682]">
      <span className="font-semibold uppercase tracking-[0.12em] text-primary">{categoryForPost(post).label}</span>
      <span aria-hidden="true" className="text-[#c5bfca]">/</span>
      <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} aria-hidden="true" />{publishedDate(post.published_at)}</span>
    </div>
  );
}

function SideStory({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group grid min-w-0 overflow-hidden rounded-xl border border-[#ece9f1] bg-white md:grid-cols-[0.92fr_1.08fr]">
      <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="relative block aspect-[16/9] overflow-hidden bg-[#f4f0f7] md:aspect-auto md:min-h-[168px]">
        <ArticleImage post={post} sizes="(min-width: 768px) 220px, 100vw" className="" />
      </Link>
      <div className="flex min-w-0 flex-col justify-center p-5">
        <StoryMeta post={post} />
        <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-[#19151f]"><Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-primary">{post.title}</Link></h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#706a7a]">{post.excerpt}</p>
      </div>
    </article>
  );
}

function StandardStory({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group min-w-0">
      <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="relative mb-4 block aspect-[3/2] overflow-hidden rounded-xl bg-[#f4f0f7]">
        <ArticleImage post={post} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="" />
      </Link>
      <StoryMeta post={post} />
      <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#19151f]"><Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary">{post.title}</Link></h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#706a7a]">{post.excerpt}</p>
      <Link href={`/blog/${post.slug}`} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Explore story <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
    </article>
  );
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedCategory = params.category ?? "";
  let posts: BlogPostSummary[] = [];
  let loadFailed = false;
  try { posts = await getPublishedBlogPosts(); } catch { loadFailed = true; }
  const categories = availableBlogCategories(posts);
  const filteredPosts = filterBlogPosts(posts, query, selectedCategory);
  const [featured, ...stories] = filteredPosts;
  const [largeStory, ...otherStories] = stories;
  const [sideOne, sideTwo, ...moreStories] = otherStories;

  return (
    <main className="min-h-screen bg-white pb-20">
      <section className="border-b border-[#ece9f1] bg-[#fbfafc]">
        <div className="page-container py-12 sm:py-16 lg:py-[4.5rem]">
          <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)] md:gap-12">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">The Purple Squad Journal</p>
              <div className="mt-5 h-px w-12 bg-primary" aria-hidden="true" />
              <h1 className="mt-5 text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.055em] text-[#19151f]">Your Home,<br className="hidden sm:block" /> <span className="text-primary">Our Expertise.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#706a7a] sm:text-lg sm:leading-8">Thoughtful guides, expert insights, and everything you need to care for your home.</p>
            </div>
            <p className="max-w-sm border-l border-[#dcd5e4] pl-5 text-sm leading-7 text-[#706a7a] md:justify-self-end">Practical knowledge for the everyday moments that make a house feel like home.</p>
          </div>
        </div>
      </section>

      <div className="page-container">
        {featured ? (
          <section className="pt-10 sm:pt-14" aria-labelledby="featured-story">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Featured story</span>
              <span className="h-px flex-1 bg-[#ece9f1]" aria-hidden="true" />
            </div>
            <article className="group grid overflow-hidden rounded-2xl border border-[#ece9f1] bg-white md:grid-cols-[1.65fr_1fr]">
              <Link href={`/blog/${featured.slug}`} aria-label={`Explore ${featured.title}`} className="relative block aspect-[16/10] overflow-hidden bg-[#f4f0f7] md:aspect-auto md:min-h-[390px]">
                <ArticleImage post={featured} sizes="(min-width: 768px) 64vw, 100vw" className="" />
              </Link>
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
                <StoryMeta post={featured} />
                <h2 id="featured-story" className="mt-4 text-2xl font-bold leading-tight tracking-[-0.035em] text-[#19151f] sm:text-3xl lg:text-[2.45rem]"><Link href={`/blog/${featured.slug}`} className="transition-colors hover:text-primary">{featured.title}</Link></h2>
                <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#706a7a] sm:text-base">{featured.excerpt}</p>
                <Link href={`/blog/${featured.slug}`} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border-b border-primary font-semibold text-primary transition-colors hover:text-[#36006d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Explore story <ArrowRight size={16} /></Link>
              </div>
            </article>
          </section>
        ) : (
          <section className="mt-10 rounded-2xl border border-[#ece9f1] bg-[#fbfafc] px-6 py-14 text-center sm:mt-14">
            <BookOpen className="mx-auto text-primary" size={34} strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#19151f]">{loadFailed ? "The journal is temporarily unavailable" : query || selectedCategory ? "No stories match those filters" : "New stories are on their way"}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[#706a7a]">{loadFailed ? "Please try again shortly, or explore our existing home care guides." : "Try a different search or browse our practical care guides."}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/guides" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#36006d]">Browse care guides</Link>
              {(query || selectedCategory) && <Link href="/blog" className="inline-flex min-h-11 items-center rounded-lg border border-[#ded7e7] px-5 text-sm font-semibold text-[#514b58] hover:bg-white">Clear filters</Link>}
            </div>
          </section>
        )}

        <section className="mt-10 border-y border-[#ece9f1] py-4 sm:mt-12" aria-label="Browse journal stories">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {categories.length > 0 ? <nav aria-label="Journal categories" className="mobile-scroll-row flex gap-6 overflow-x-auto" role="navigation">
              <Link aria-current={!selectedCategory ? "page" : undefined} href={withFilters(query, "")} className={`flex min-h-11 shrink-0 items-center border-b-2 px-0.5 text-sm font-semibold transition-colors ${!selectedCategory ? "border-primary text-primary" : "border-transparent text-[#706a7a] hover:text-primary"}`}>All Stories</Link>
              {categories.map((category) => <Link key={category.slug} aria-current={selectedCategory === category.slug ? "page" : undefined} href={withFilters(query, category.slug)} className={`flex min-h-11 shrink-0 items-center border-b-2 px-0.5 text-sm font-semibold transition-colors ${selectedCategory === category.slug ? "border-primary text-primary" : "border-transparent text-[#706a7a] hover:text-primary"}`}>{category.label}</Link>)}
            </nav> : <span className="min-h-11" />}
            <form action="/blog" method="get" role="search" className="flex min-h-11 items-center gap-2 rounded-lg border border-[#e5e0e9] bg-white px-3 focus-within:ring-2 focus-within:ring-primary/25 lg:w-[300px]">
              <Search className="h-4 w-4 shrink-0 text-[#8c8492]" aria-hidden="true" />
              <input type="search" name="q" defaultValue={query} placeholder="Search the journal" aria-label="Search article titles and summaries" className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#19151f] outline-none placeholder:text-[#9a93a0] focus:ring-0" />
              {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
              <button type="submit" className="min-h-9 rounded-md px-2 text-xs font-bold text-primary hover:bg-[#f5f0ff]">Search</button>
            </form>
          </div>
        </section>

        {largeStory && <section className="mt-10 sm:mt-14" aria-labelledby="latest-stories">
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Fresh perspectives</p>
            <h2 id="latest-stories" className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#19151f] sm:text-4xl">The Latest Stories</h2>
            <p className="mt-3 text-sm leading-7 text-[#706a7a] sm:text-base">Fresh ideas and practical advice for a better home.</p>
          </div>
          <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="group min-w-0 md:col-span-2 lg:col-span-1 lg:row-span-2">
              <Link href={`/blog/${largeStory.slug}`} aria-label={`Read ${largeStory.title}`} className="relative mb-5 block aspect-[16/10] overflow-hidden rounded-xl bg-[#f4f0f7]">
                <ArticleImage post={largeStory} sizes="(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw" className="" />
              </Link>
              <StoryMeta post={largeStory} />
              <h3 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.035em] text-[#19151f] sm:text-3xl"><Link href={`/blog/${largeStory.slug}`} className="transition-colors hover:text-primary">{largeStory.title}</Link></h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#706a7a] sm:text-base">{largeStory.excerpt}</p>
              <Link href={`/blog/${largeStory.slug}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Explore story <ArrowRight size={15} /></Link>
            </article>
            <div className="grid content-start gap-5 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1">{sideOne ? <SideStory post={sideOne} /> : null}{sideTwo ? <SideStory post={sideTwo} /> : null}</div>
          </div>
          {moreStories.length > 0 && <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{moreStories.map((post) => <StandardStory key={post.id} post={post} />)}</div>}
        </section>}

        <section className="mt-16 border-t border-[#ece9f1] pt-12 sm:mt-20 sm:pt-16" aria-labelledby="care-guides">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Evergreen home know-how</p><h2 id="care-guides" className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#19151f] sm:text-4xl">Your Home, Taken Care Of.</h2></div>
            <p className="max-w-lg text-sm leading-7 text-[#706a7a]">Practical knowledge for a safer, cleaner, and more comfortable home.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {Object.entries(maintenanceGuides).map(([slug, guide]) => {
              const visual = guideImages[slug];
              return <article key={slug} className="group grid overflow-hidden rounded-xl border border-[#ece9f1] bg-white sm:grid-cols-[0.9fr_1.1fr]">
                <Link href={`/guides/${slug}`} aria-label={`Read ${guide.title}`} className="relative block aspect-[16/9] overflow-hidden bg-[#f4f0f7] sm:aspect-auto sm:min-h-[220px]">
                  {visual && <Image src={visual.src} alt={visual.alt} fill sizes="(min-width: 640px) 260px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none" />}
                </Link>
                <div className="flex flex-col justify-center p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Care guide</p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-[#19151f]"><Link href={`/guides/${slug}`} className="hover:text-primary">{guide.title}</Link></h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#706a7a]">{guide.description}</p>
                  <Link href={`/guides/${slug}`} className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-primary">Read guide <ArrowRight size={15} /></Link>
                </div>
              </article>;
            })}
          </div>
        </section>

        {posts.length > 0 && <section className="mt-16 bg-[#4b008f] px-6 py-10 text-white sm:mt-20 sm:px-10 sm:py-12" aria-labelledby="journal-services">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Purple Squad Services</p><h2 id="journal-services" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Good Advice. Better Service.</h2><p className="mt-2 max-w-xl text-sm leading-7 text-violet-100">When your home needs professional attention, find the right service with Purple Squad.</p></div>
            <Link href="/services" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#36006d] transition-colors hover:bg-[#f5f0ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explore Services <ArrowRight size={16} /></Link>
          </div>
        </section>}
      </div>
    </main>
  );
}
