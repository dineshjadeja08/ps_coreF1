import { describe, expect, it } from "vitest";

import { availableBlogCategories, categoryForPost, filterBlogPosts } from "./category";
import type { BlogPostSummary } from "@/types/api";

const posts: BlogPostSummary[] = [
  { id: "1", title: "AC care", slug: "ac-care", excerpt: "Cooling tips", author_name: "Team", cover_image_url: "", related_service_slug: "ac-repair", published_at: null, updated_at: "2026-01-01" },
  { id: "2", title: "Washer care", slug: "washer-care", excerpt: "Laundry tips", author_name: "Team", cover_image_url: "", related_service_slug: "washing-machine-repair", published_at: null, updated_at: "2026-01-01" },
];

describe("journal categories and search", () => {
  it("derives only available categories from published service relationships", () => {
    expect(availableBlogCategories(posts)).toEqual([
      { slug: "ac-services", label: "AC Services" },
      { slug: "appliance-care", label: "Appliance Care" },
    ]);
  });

  it("filters by query and category", () => {
    expect(filterBlogPosts(posts, "laundry", "appliance-care").map((post) => post.slug)).toEqual(["washer-care"]);
    expect(filterBlogPosts(posts, "cooling", "appliance-care")).toEqual([]);
    expect(categoryForPost(posts[0]).slug).toBe("ac-services");
  });
});
