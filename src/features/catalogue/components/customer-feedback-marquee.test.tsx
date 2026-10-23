import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CustomerFeedbackMarquee } from "@/features/catalogue/components/customer-feedback-marquee";
import type { Review } from "@/types/api";

const reviews: Review[] = [
  { id: "review-1", booking: null, customer: { name: "Arun Kumar" }, technician: null, rating: 5, comment: "Excellent service and a very professional technician.", is_visible: true, created_at: "2026-10-07T00:00:00Z", updated_at: "2026-10-07T00:00:00Z" },
  { id: "review-2", booking: null, customer: { name: "Kavya R" }, technician: null, rating: 4, comment: "The service was completed neatly and on time.", is_visible: true, created_at: "2026-10-07T00:00:00Z", updated_at: "2026-10-07T00:00:00Z" },
  { id: "review-3", booking: null, customer: { name: "Shalini P" }, technician: null, rating: 4, comment: "Helpful technician and a smooth booking experience.", is_visible: true, created_at: "2026-10-07T00:00:00Z", updated_at: "2026-10-07T00:00:00Z" },
];

describe("customer feedback marquee", () => {
  it("renders two labeled rows, actual review text and a visual duplicate track", () => {
    const html = renderToStaticMarkup(<CustomerFeedbackMarquee reviews={reviews} />);
    expect(html).toContain("Customer reviews, first row");
    expect(html).toContain("Customer reviews, second row");
    expect(html).toContain("Excellent service and a very professional technician.");
    expect(html).toContain("aria-hidden=\"true\"");
    expect(html).toContain("feedback-marquee-track-left");
    expect(html).toContain("feedback-marquee-track-right");
  });

  it("does not render a marquee when there are no reviews", () => {
    expect(renderToStaticMarkup(<CustomerFeedbackMarquee reviews={[]} />)).toBe("");
  });
});
