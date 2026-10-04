import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const siteUrl = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/book", "/bookings", "/booking-success", "/cart", "/checkout", "/login", "/profile", "/search", "/technician/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
