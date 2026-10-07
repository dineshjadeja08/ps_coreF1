import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReviewCard } from "@/features/catalogue/components/review-card";
import type { Review } from "@/features/catalogue/types";

const review: Review = {
  id: "review-1", booking: null, customer: { name: "Arun Kumar" }, technician: null,
  rating: 2, comment: "The appointment timing could have been communicated more clearly.",
  is_visible: true, is_booking_review: false,
  created_at: "2026-10-07T00:00:00Z", updated_at: "2026-10-07T00:00:00Z",
};

describe("professional review card", () => {
  it("shows the customer, exact rating and critical feedback without fake verification or review dates", () => {
    const html = renderToStaticMarkup(<ReviewCard review={review} />);
    expect(html).toContain("Arun Kumar");
    expect(html).toContain("2 out of 5 stars");
    expect(html).toContain(review.comment);
    expect(html).not.toContain("Completed booking review");
    expect(html).not.toContain("<time");
  });

  it("labels booking-linked feedback and prefers the supplied reviewer name", () => {
    const html = renderToStaticMarkup(<ReviewCard review={{ ...review, reviewer_name: "Sanjay", booking: "booking-1", is_booking_review: true }} />);
    expect(html).toContain("Sanjay");
    expect(html).toContain("Completed booking review");
    expect(html).toContain("<time");
  });
});
