import { describe, expect, it } from "vitest";

import { canonicalFor, serviceJsonLd } from "@/lib/seo";
import type { Review, ServiceListItem } from "@/types/api";
import { publicPageMetadata } from "@/lib/page-metadata";
import robots from "@/app/robots";

describe("indexing foundations", () => {
  it("normalizes canonicals to HTTPS apex and removes query/hash duplicates", () => {
    expect(canonicalFor("/services?category=ac&utm_source=test#packages")).toBe("https://purplesquad.in/services");
    expect(canonicalFor("http://www.purplesquad.in/about/")).toBe("https://purplesquad.in/about");
  });
  it("gives public pages their own canonical and social preview", () => {
    const metadata = publicPageMetadata("/support", "Contact us", "Get service booking help.");
    expect(metadata.alternates).toEqual({ canonical: "https://purplesquad.in/support" });
    expect(metadata.openGraph).toMatchObject({ url: "https://purplesquad.in/support" });
  });
  it("allows crawling noindex pages and advertises the production sitemap", () => {
    expect(robots().rules).toEqual([{ userAgent: "*", allow: "/", disallow: ["/api/"] }]);
    expect(robots().sitemap).toBe("https://purplesquad.in/sitemap.xml");
  });
});

describe("service structured data", () => {
  const service = { slug: "ac-service", name: "AC service", category: { name: "AC" }, effective_price: 299, short_description: "AC inspection", cover_image: "/images/service-icons/ac.png" } as ServiceListItem;
  it("uses real prices, absolute images and independently defined provider identity", () => {
    const schema = serviceJsonLd(service, "/services/ac-service");
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema.offers).toMatchObject({ price: "299", priceCurrency: "INR" });
    expect(schema.image).toBe("https://purplesquad.in/images/service-icons/ac.png");
    expect(schema.provider).toMatchObject({ name: "Purple Squad", url: "https://purplesquad.in" });
    expect(schema.areaServed).toEqual([{ "@type": "City", name: "Chennai" }]);
  });
  it("does not turn imported testimonials or invalid ratings into a verified aggregate", () => {
    const reviews = [{ rating: 5, is_visible: true, is_booking_review: false }, { rating: 8, is_visible: true, is_booking_review: true }] as Review[];
    expect(serviceJsonLd(service, "/services/ac-service", reviews)).not.toHaveProperty("aggregateRating");
  });
});
