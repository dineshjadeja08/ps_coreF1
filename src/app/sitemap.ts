import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;

const publicRoutes = [
  "",
  "/services",
  "/book",
  "/login",
  "/bookings",
  "/profile",
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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/services" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/services" ? 0.9 : 0.6,
  }));
}
