import type { MetadataRoute } from "next";

import { getSitemapCatalogue } from "@/features/catalogue/server";
import { absoluteUrl, canonicalFor } from "@/lib/seo";

// API failure must not publish an incomplete sitemap.
export const dynamic = "force-dynamic";

const publicRoutes = ["/", "/services", "/about", "/support", "/join-as-technician", "/partner-support", "/service-standards", "/faq", "/privacy-policy", "/terms", "/cancellation-policy"];
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function genuineDate(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return undefined;
  return value;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services, categories, pages } = await getSitemapCatalogue();
  const entries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({ url: canonicalFor(path) }));
  for (const category of categories) {
    if (validSlug.test(category.slug)) entries.push({ url: canonicalFor(`/services/${category.slug}`) });
  }
  for (const service of services) {
    if (!validSlug.test(service.slug)) continue;
    entries.push({
      url: canonicalFor(`/services/${service.slug}`),
      lastModified: genuineDate(service.updated_at),
      images: service.cover_image ? [absoluteUrl(service.cover_image)] : undefined,
    });
  }
  for (const page of pages) {
    if (!page.is_indexable || page.city !== "Chennai" || !/^\/[a-z0-9-]+-chennai(?:\/[a-z0-9-]+)?$/.test(page.path)) continue;
    if (page.path !== `/${page.page_slug}`) continue;
    entries.push({ url: canonicalFor(page.path), lastModified: genuineDate(page.updated_at) });
  }
  if (entries.length > 50000) throw new Error("Sitemap exceeds 50,000 URLs; split it before publishing");
  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}
