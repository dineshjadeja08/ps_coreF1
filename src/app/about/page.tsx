import type { Metadata } from "next";

import { FooterLinkPage } from "@/components/common/footer-link-page";
import { JsonLd } from "@/components/seo/json-ld";
import { canonicalFor, localBusinessJsonLd } from "@/lib/seo";

const values = ["Clear pricing before booking", "Verified service professionals", "Simple booking flow", "Support through the service journey"];

export const metadata: Metadata = {
  title: "About Purple Squad",
  description: "Learn about Purple Squad and our trusted home services across Chennai, Bangalore, and Coimbatore.",
  alternates: {
    canonical: canonicalFor("/about"),
  },
  openGraph: {
    url: canonicalFor("/about"),
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <FooterLinkPage
        eyebrow="Purple Squad"
        title="About Purple Squad"
        intro="Purple Squad is a home-services platform for appliance repair, cleaning, installation, and maintenance. We help customers book trusted service professionals with clear packages, service support, and a simple digital booking flow."
        quote="Reliable home service should feel simple, transparent, and cared for from the first click to final completion."
        details={[
          { title: "Currently serving", lines: ["Chennai", "Bangalore", "Coimbatore"] },
          { title: "Support", lines: ["support@purplesquad.in", "76760 76361"] },
        ]}
      >
        <div className="grid gap-2 text-sm font-semibold text-black sm:grid-cols-2">
          {values.map((value) => (
            <p key={value} className="border border-black px-4 py-3">
              {value}
            </p>
          ))}
        </div>
      </FooterLinkPage>
    </>
  );
}
