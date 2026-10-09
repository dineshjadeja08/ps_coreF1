import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { SeoLandingPage, ServiceDetail } from "@/types/api";

vi.mock("next/navigation", () => ({ useParams: () => ({ slug: "ac-inspection" }) }));
vi.mock("@/features/location/selected-location", () => ({ useSelectedLocation: () => ({ city: "Chennai", pincode: "" }) }));
vi.mock("@/features/cart/cart-controls", () => ({ AddToCartButton: () => <button>Add to cart</button>, CartSummary: () => null }));
vi.mock("@/features/catalogue/components/landing/cart-sticky-bar", () => ({ CartStickyBar: () => null }));
vi.mock("@/features/catalogue/queries", () => ({
  useServiceDetail: (_slug: string, initial: unknown) => ({ data: initial, isLoading: false }),
  useServices: (_query: unknown, initial: unknown) => ({ data: initial }),
  useServiceReviews: (_id: string, initial: unknown) => ({ data: initial }),
  useServiceFaqs: () => ({ data: [] }),
}));

import { ServiceDetailView } from "./service-detail-view";

describe("visible server-rendered service content", () => {
  it("renders one location-specific H1, packages, real prices, FAQs and booking controls without JS", () => {
    const service = { id: "1", slug: "ac-inspection", name: "AC Inspection", category: { slug: "ac", name: "AC" }, short_description: "Inspect poor cooling before repair", effective_price: 299, base_price: "299", estimated_duration_minutes: 30 } as ServiceDetail;
    const seo = { h1: "AC Repair in Chennai", service_name: "AC Repair", intro_content: "Compare inspection before selecting repair.", pricing_intro: "Use live package prices.", services: [service], coverage_areas: ["Chennai"], faqs: [{ question: "How do I book?", answer: "Choose an available package." }], related_pages: [] } as unknown as SeoLandingPage;
    const html = renderToStaticMarkup(<ServiceDetailView initialService={service} serviceSlug={service.slug} initialServices={{ count: 1, next: null, previous: null, results: [service] }} seoContent={seo} />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("AC Repair in Chennai");
    expect(html).toContain("AC Inspection");
    expect(html).toContain("299");
    expect(html).toContain("How do I book?");
    expect(html).toContain("Add to cart");
    expect(html).not.toContain("4.8");
    expect(html).not.toContain('class="sr-only"');
  });
});
