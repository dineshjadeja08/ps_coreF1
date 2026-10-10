import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FaqItem } from "./faq-item";
import { ReviewList } from "./review-list";
import type { Review } from "@/features/catalogue/types";

const reviews: Review[] = Array.from({ length: 5 }, (_, index) => ({
  id: `review-${index}`, booking: null, customer: { name: `Customer ${index}` }, technician: null,
  rating: 3, comment: `Feedback ${index}`, is_visible: true,
  created_at: "2026-10-07T00:00:00Z", updated_at: "2026-10-07T00:00:00Z",
}));

describe("popup FAQs and review expansion", () => {
  it("keeps FAQs keyboard-operable with a decorative dropdown chevron", () => {
    const html = renderToStaticMarkup(<FaqItem question="What is included?" answer="Inspection." />);
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("What is included?");
    expect(html).toContain("Inspection.");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("group-open:rotate-180");
  });
  it("shows three initial reviews and exposes all remaining reviews in a collapsed native disclosure", () => {
    const html = renderToStaticMarkup(<ReviewList reviews={reviews} />);
    expect(html.split("<article")).toHaveLength(6);
    expect(html).toContain("Read more reviews (2)");
    expect(html).toContain("Show fewer reviews");
    expect(html).not.toContain("<details open");
    expect(html.indexOf("<details")).toBeGreaterThan(html.indexOf("Feedback 2"));
    expect(html.indexOf("Feedback 3")).toBeGreaterThan(html.indexOf("<details"));
  });
  it("does not invent extra reviews or show unpublished feedback", () => {
    const html = renderToStaticMarkup(<ReviewList reviews={reviews.map((review, index) => ({ ...review, is_visible: index < 2 }))} />);
    expect(html).not.toContain("Read more reviews");
    expect(html).not.toContain("Feedback 2");
    expect(html.split("<article")).toHaveLength(3);
  });
});
