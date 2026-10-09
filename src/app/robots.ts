import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const siteUrl = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private page shells must remain crawlable for their noindex metadata.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
