"use client";

import { useMutation } from "@tanstack/react-query";

import { reviewsApi } from "@/features/reviews/api";
import type { ReviewCreateRequest } from "@/features/reviews/types";

export function useCreateBookingReview() {
  return useMutation({
    mutationFn: ({ bookingId, body }: { bookingId: string; body: ReviewCreateRequest }) => reviewsApi.createForBooking(bookingId, body),
  });
}
