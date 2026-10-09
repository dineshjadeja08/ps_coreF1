import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HomeDiscovery } from "@/features/catalogue/components/home-discovery";
import { getServicesForSeo } from "@/features/catalogue/server";
import { canonicalFor, defaultOgImagePath, localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

// Avoid the prerendered metadata wrapper before the GTM verification iframe.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Purple Squad | Home Appliance Services in Chennai",
  },
  description:
    "Book trusted AC, appliance repair, cleaning, CCTV, geyser, and water purifier services at your doorstep in Chennai with Purple Squad.",
  alternates: {
    canonical: canonicalFor("/"),
  },
  openGraph: {
    title: "Purple Squad | Home Appliance Services in Chennai",
    description:
      "Book trusted AC, appliance repair, cleaning, CCTV, geyser, and water purifier services at your doorstep in Chennai.",
    url: canonicalFor("/"),
    images: [defaultOgImagePath],
  },
  twitter: {
    title: "Purple Squad | Home Appliance Services in Chennai",
    description:
      "Book trusted AC, appliance repair, cleaning, CCTV, geyser, and water purifier services at your doorstep in Chennai.",
    images: [defaultOgImagePath],
  },
};

export default async function Home() {
  const services = await getServicesForSeo({ page_size: 80, city: "Chennai" });
  return (
    <>
      <JsonLd data={[organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()]} />
      <HomeDiscovery initialServices={services} />
    </>
  );
}
