"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bookingsApi } from "@/features/bookings/api";
import type { BookingCreateRequest, BookingOperationRequest, BookingRescheduleRequest } from "@/features/bookings/types";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BookingCreateRequest) => bookingsApi.create(body),
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.bookingDetail(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, body }: { bookingId: string; body?: BookingOperationRequest }) => bookingsApi.cancel(bookingId, body ?? {}),
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.bookingDetail(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
    },
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, body }: { bookingId: string; body: BookingRescheduleRequest }) => bookingsApi.reschedule(bookingId, body),
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.bookingDetail(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
    },
  });
}
