import type { Booking } from "@/features/bookings/types";
import type { ReviewCreateRequest } from "@/features/reviews/types";

export function canReviewBooking(booking: Booking) {
  return booking.booking_status === "COMPLETED";
}

export function createReviewPayload(input: { rating: number; comment: string }): ReviewCreateRequest {
  return {
    rating: input.rating,
    comment: input.comment.trim(),
  };
}
