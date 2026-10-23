import { env } from "@/config/env";
import { apiPaths } from "@/lib/api/endpoints";
import type { BlogPost, BlogPostSummary, PaginatedResponse } from "@/types/api";

export class BlogApiError extends Error {
  constructor(public status: number) {
    super(`Blog request failed: ${status}`);
  }
}

async function fetchBlog<T>(path: string, page?: number): Promise<T> {
  const url = new URL(path, env.apiBaseUrl.replace(/\/$/, ""));
  if (page) {
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "100");
  }
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new BlogApiError(response.status);
  return response.json() as Promise<T>;
}

export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const posts: BlogPostSummary[] = [];
  for (let page = 1; page <= 500; page += 1) {
    const result = await fetchBlog<PaginatedResponse<BlogPostSummary>>(apiPaths.blogPosts, page);
    posts.push(...result.results);
    if (!result.next) return posts;
  }
  throw new Error("Blog listing exceeded the supported page count.");
}

export async function getPublishedBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await fetchBlog<BlogPost>(apiPaths.blogPostDetail(slug));
  } catch (error) {
    if (error instanceof BlogApiError && error.status === 404) return null;
    throw error;
  }
}
