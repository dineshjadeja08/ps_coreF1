import type { BlogPostSummary } from "@/types/api";

export type BlogCategory = { slug: string; label: string };

const categories = [
  { slug: "ac-services", label: "AC Services" },
  { slug: "plumbing", label: "Plumbing" },
  { slug: "electrical", label: "Electrical" },
  { slug: "appliance-care", label: "Appliance Care" },
  { slug: "home-care", label: "Home Care" },
];

export function categoryForPost(post: Pick<BlogPostSummary, "related_service_slug">): BlogCategory {
  const slug = post.related_service_slug?.toLowerCase() ?? "";
  if (slug.split("-").includes("ac") || slug.includes("air-condition")) return categories[0];
  if (slug.includes("plumb")) return categories[1];
  if (slug.includes("electric")) return categories[2];
  if (["washing", "refrigerator", "fridge", "tv", "chimney", "microwave", "water-purifier"].some((term) => slug.includes(term))) return categories[3];
  return categories[4];
}

export function availableBlogCategories(posts: BlogPostSummary[]) {
  const available = new Set(posts.map((post) => categoryForPost(post).slug));
  return categories.filter((category) => available.has(category.slug));
}

export function filterBlogPosts(posts: BlogPostSummary[], query: string, category: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("en-IN");
  return posts.filter((post) => {
    const matchesCategory = !category || categoryForPost(post).slug === category;
    const searchableText = `${post.title} ${post.excerpt} ${post.author_name} ${post.related_service_slug ?? ""}`.toLocaleLowerCase("en-IN");
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
}
