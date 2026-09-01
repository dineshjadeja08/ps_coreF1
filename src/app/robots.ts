import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
