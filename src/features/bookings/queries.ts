"use client";

import { useQuery } from "@tanstack/react-query";

import { bookingsApi } from "@/features/bookings/api";
import { getBookingRefreshInterval } from "@/features/bookings/job-progress";
import { queryKeys } from "@/lib/api/query-keys";

export function useBookings(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: queryKeys.bookings(params),
    queryFn: () => bookingsApi.list(params),
    refetchInterval: 15_000,
    refetchOnWindowFocus: "always",
  });
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.bookingDetail(bookingId),
    queryFn: () => bookingsApi.get(bookingId),
    enabled: Boolean(bookingId),
    refetchInterval: (query) => getBookingRefreshInterval(query.state.data?.booking_status),
    refetchOnWindowFocus: "always",
  });
}
