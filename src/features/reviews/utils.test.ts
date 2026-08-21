import { describe, expect, it } from "vitest";

import type { Booking } from "@/features/bookings/types";

import { canReviewBooking, createReviewPayload } from "./utils";

const booking = (status: Booking["booking_status"]): Booking => ({
  id: "booking-1",
  booking_number: "PS-0001",
  service: {},
  address_snapshot: {},
  service_date: "2026-08-22",
  time_slot: {},
  problem_description: "Done.",
  subtotal: "699.00",
  discount_amount: "0.00",
  tax_amount: "0.00",
  total_amount: "699.00",
  advance_required: "199.00",
  advance_paid: "199.00",
  balance_due: "0.00",
  balance_collected: "500.00",
  payment_status: "PAID",
  booking_status: status,
  confirmed_at: null,
  completed_at: null,
  cancelled_at: null,
  created_at: "2026-08-20T10:00:00Z",
  updated_at: "2026-08-20T10:00:00Z",
  status_history: [],
});

describe("review utilities", () => {
  it("allows reviews only for completed bookings", () => {
    expect(canReviewBooking(booking("COMPLETED"))).toBe(true);
    expect(canReviewBooking(booking("CONFIRMED"))).toBe(false);
    expect(canReviewBooking(booking("CANCELLED"))).toBe(false);
  });

  it("creates the OpenAPI review payload", () => {
    expect(createReviewPayload({ rating: 5, comment: "  Great service. " })).toEqual({
      rating: 5,
      comment: "Great service.",
    });
  });
});
