import type { Metadata } from "next";

import { canonicalFor, compactDescription, defaultOgImagePath } from "@/lib/seo";

export function publicPageMetadata(path: string, title: string, description: string, image = defaultOgImagePath): Metadata {
  const canonical = canonicalFor(path);
  const summary = compactDescription(description);
  return {
    title,
    description: summary,
    alternates: { canonical },
    openGraph: { type: "website", locale: "en_IN", siteName: "Purple Squad", title: `${title} | Purple Squad`, description: summary, url: canonical, images: [image] },
    twitter: { card: "summary_large_image", title: `${title} | Purple Squad`, description: summary, images: [image] },
  };
}
