import type { MetadataRoute } from "next";

import { getSitemapCatalogue } from "@/features/catalogue/server";
import { absoluteUrl, canonicalFor } from "@/lib/seo";
import { getCategoryVisualSrc, resolveServiceImage, serviceHeroImage, serviceListImage, servicePageImages } from "@/lib/service-images";

// API failure must not publish an incomplete sitemap.
export const dynamic = "force-dynamic";

const publicRoutes = ["/", "/services", "/about", "/support", "/join-as-technician", "/partner-support", "/service-standards", "/faq", "/privacy-policy", "/terms", "/cancellation-policy"];
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function genuineDate(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return undefined;
  return value;
}

function imageUrls(sources: Array<string | null | undefined>) {
  return Array.from(new Set(sources.filter((source): source is string => Boolean(source && (/^https:\/\//i.test(source) || /^\/(?!\/)/.test(source)))).map((source) => absoluteUrl(source)))).filter((source) => {
    try {
      const url = new URL(source);
      return url.protocol === "https:" && !url.username && !url.password && !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname);
    } catch { return false; }
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services, categories, categoryServices = services, pages } = await getSitemapCatalogue();
  const entries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({ url: canonicalFor(path) }));
  entries.push({ url: canonicalFor("/services"), images: imageUrls([
    ...categories.map(getCategoryVisualSrc),
    ...categoryServices.slice(0, 40).map((service) => resolveServiceImage(service.cover_image, service.name).src),
  ]) });
  for (const category of categories) {
    const packages = categoryServices.filter((service) => service.category?.slug === category.slug).slice(0, category.slug === "ac-services" ? 80 : 40);
    const primary = packages.find((service) => service.landing_thumbnail || service.cover_image) ?? packages[0];
    if (validSlug.test(category.slug)) entries.push({
      url: canonicalFor(`/services/${category.slug}`),
      images: imageUrls(category.slug === "ac-services" ? [primary ? serviceHeroImage(primary) : null, ...packages.map(serviceListImage)] : [getCategoryVisualSrc(category), ...packages.map((service) => resolveServiceImage(service.cover_image, service.name).src)]),
    });
  }
  for (const service of services) {
    if (!validSlug.test(service.slug)) continue;
    entries.push({
      url: canonicalFor(`/services/${service.slug}`),
      lastModified: genuineDate(service.updated_at),
      images: imageUrls(servicePageImages(service)),
    });
  }
  for (const page of pages) {
    if (!page.is_indexable || page.city !== "Chennai" || !/^\/[a-z0-9-]+-chennai(?:\/[a-z0-9-]+)?$/.test(page.path)) continue;
    if (page.path !== `/${page.page_slug}`) continue;
    entries.push({ url: canonicalFor(page.path), lastModified: genuineDate(page.updated_at), images: "services" in page ? imageUrls([page.services[0] ? serviceHeroImage(page.services[0]) : null, ...page.services.map(serviceListImage)]) : undefined });
  }
  if (entries.length > 50000) throw new Error("Sitemap exceeds 50,000 URLs; split it before publishing");
  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of entries) {
    const existing = unique.get(entry.url);
    unique.set(entry.url, { ...existing, ...entry, lastModified: entry.lastModified ?? existing?.lastModified, images: imageUrls([...(existing?.images ?? []), ...(entry.images ?? [])]) });
  }
  // Next 16.3's sitemap serializer interpolates image URLs without XML escaping.
  // Escape once, after URL validation/deduplication, so CDN query strings stay valid XML.
  return Array.from(unique.values()).map((entry) => ({ ...entry, images: entry.images?.map((image) => image.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;")) }));
}
