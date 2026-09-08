import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HomeDiscovery } from "@/features/catalogue/components/home-discovery";
import { canonicalFor, defaultOgImagePath, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Expert Home Services",
  description: "Discover Purple Squad home services, check service availability, search the catalogue, and compare pricing.",
  alternates: {
    canonical: canonicalFor("/"),
  },
  openGraph: {
    url: canonicalFor("/"),
    images: [defaultOgImagePath],
  },
  twitter: {
    images: [defaultOgImagePath],
  },
};

export default function Home() {
  return (
    <>
      <JsonLd data={[localBusinessJsonLd("/"), websiteJsonLd()]} />
      <HomeDiscovery />
    </>
  );
}
