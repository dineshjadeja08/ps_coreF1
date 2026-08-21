"use client";

import { useQuery } from "@tanstack/react-query";

import { bookingsApi } from "@/features/bookings/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useBookings(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: queryKeys.bookings(params),
    queryFn: () => bookingsApi.list(params),
  });
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.bookingDetail(bookingId),
    queryFn: () => bookingsApi.get(bookingId),
    enabled: Boolean(bookingId),
  });
}
