import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HomeDiscovery } from "@/features/catalogue/components/home-discovery";
import { canonicalFor, defaultOgImagePath, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

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

export default function Home() {
  return (
    <>
      <JsonLd data={[localBusinessJsonLd(), websiteJsonLd()]} />
      <HomeDiscovery />
    </>
  );
}
