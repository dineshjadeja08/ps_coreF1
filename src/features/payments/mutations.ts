"use client";

import { useMutation } from "@tanstack/react-query";

import { paymentsApi } from "@/features/payments/api";
import type { PaymentVerifyRequest } from "@/features/payments/types";

export function useCreateAdvancePaymentOrder() {
  return useMutation({
    mutationFn: (bookingId: string) => paymentsApi.createAdvanceOrder(bookingId),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (body: PaymentVerifyRequest) => paymentsApi.verify(body),
  });
}
