import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getServicesForSeo } from "@/features/catalogue/server";
import { absoluteUrl } from "@/lib/seo";

const siteUrl = siteConfig.url;

const publicRoutes = [
  "",
  "/services",
  "/book",
  "/about",
  "/support",
  "/join-as-technician",
  "/partner-support",
  "/service-standards",
  "/faq",
  "/privacy-policy",
  "/terms",
  "/cancellation-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const services = await getServicesForSeo({ page_size: 100 });

  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/services" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/services" ? 0.9 : 0.6,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.results.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    images: service.cover_image ? [absoluteUrl(service.cover_image)] : undefined,
  }));

  return [...staticEntries, ...serviceEntries];
}
